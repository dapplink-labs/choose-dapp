/**
 * AWS IoT Core MQTT 客户端工具
 *
 * 使用 Cognito 匿名身份池获取临时凭证，通过 SigV4 签名建立 WebSocket 连接。
 *
 * 依赖: mqtt, aws-amplify
 *
 * 使用示例:
 *   import { createIotMqttClient } from '@/utils/mqttClient'
 *
 *   const client = createIotMqttClient({
 *     region: 'ap-southeast-1',
 *     endpoint: 'xxxx.iot.ap-southeast-1.amazonaws.com',
 *     identityPoolId: 'ap-southeast-1:xxxx',
 *   })
 *
 *   await client.connect()
 *   client.on('message', (topic, data) => { ... })
 *   client.subscribe(['price/evt/sub', 'user/user_guid/orders'])
 *   client.destroy()
 */

import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import mqtt from 'mqtt'

// ─── Web Crypto SigV4 工具函数 ─────────────────────────────────────────────

const toAmzDate = (d) => d.toISOString().replace(/[:-]|\.\d{3}/g, '')
const toDateStamp = (d) => toAmzDate(d).slice(0, 8)

const hexFromBuffer = (buf) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const sha256Hex = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return hexFromBuffer(digest)
}

const hmacSha256 = async (keyRaw, dataText) => {
  const key = await crypto.subtle.importKey('raw', keyRaw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataText))
}

/**
 * 生成 AWS IoT WebSocket 连接的 SigV4 签名 URL
 * @param {string} endpoint - IoT 端点 hostname
 * @param {string} region - AWS 区域
 * @param {{ accessKeyId, secretAccessKey, sessionToken }} creds - AWS 临时凭证
 * @returns {Promise<string>} wss:// 签名 URL
 */
async function getSignedMqttUrl(endpoint, region, creds) {
  const now = new Date()
  const dateStamp = toDateStamp(now)
  const amzDate = toAmzDate(now)
  const service = 'iotdevicegateway'
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`

  // AWS IoT Core WebSocket 特殊要求：X-Amz-Security-Token 不参与签名，
  // 在签名完成后追加到 URL 末尾，否则握手会失败。
  const canonicalQuerystring = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${encodeURIComponent(`${creds.accessKeyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    'X-Amz-SignedHeaders=host',
  ]
    .sort()
    .join('&')

  const canonicalRequest = [
    'GET',
    '/mqtt',
    canonicalQuerystring,
    `host:${endpoint}\n`,
    'host',
    await sha256Hex(''),
  ].join('\n')

  const stringToSign = [algorithm, amzDate, credentialScope, await sha256Hex(canonicalRequest)].join('\n')

  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${creds.secretAccessKey}`), dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')
  const signature = hexFromBuffer(await hmacSha256(kSigning, stringToSign))

  let url = `wss://${endpoint}/mqtt?${canonicalQuerystring}&X-Amz-Signature=${signature}`
  if (creds.sessionToken) {
    url += `&X-Amz-Security-Token=${encodeURIComponent(creds.sessionToken)}`
  }
  return url
}

// ─── 检测 Web Crypto 可用性 ────────────────────────────────────────────────

export const hasWebCrypto = () =>
  typeof globalThis !== 'undefined' && !!globalThis.crypto?.subtle

// ─── 主工厂函数 ───────────────────────────────────────────────────────────

/**
 * 创建受管理的 IoT MQTT 客户端实例
 *
 * @param {{
 *   region: string,
 *   endpoint: string,
 *   identityPoolId: string,
 *   reconnectDelay?: number,   // 重连延迟(ms), 默认 2000
 *   credRefreshAhead?: number, // 凭证到期前提前刷新时间(ms), 默认 5分钟
 * }} options
 * @returns {{
 *   connect(): Promise<void>,
 *   subscribe(topics: string[]): void,
 *   unsubscribe(topics: string[]): void,
 *   on(event: 'message'|'connect'|'disconnect'|'error', handler: Function): void,
 *   off(event: string, handler: Function): void,
 *   destroy(): void,
 *   isReady(): boolean,
 * }}
 */
export function createIotMqttClient(options) {
  const {
    region,
    endpoint,
    identityPoolId,
    reconnectDelay = 2000,
    credRefreshAhead = 5 * 60 * 1000,
  } = options

  // 内部状态
  // _client: mqtt.js 客户端实例
  // _credentials: 凭证
  // _destroyed: 是否已销毁
  // _reconnectTimer: 重连定时器
  // _credRefreshTimer: 凭证刷新定时器
  // _pendingTopics: 待订阅的 topic 列表
  let _client = null
  let _credentials = null
  let _destroyed = false
  let _reconnectTimer = null
  let _credRefreshTimer = null
  let _pendingTopics = new Set()

  // 事件监听器
  const _listeners = { message: [], connect: [], disconnect: [], error: [] }

  // 事件发射器，用于触发事件监听器
  const _emit = (event, ...args) => {
    ; (_listeners[event] || []).forEach((fn) => {
      try { fn(...args) } catch (e) { console.error(`[MqttClient] listener error (${event})`, e) }
    })
  }

  // ── 凭证获取 ──────────────────────────────────────────────────────────
  const _fetchCredentials = async () => {
    // 确保 Amplify 已配置
    try {
      Amplify.configure({
        Auth: {
          Cognito: {
            identityPoolId,
            allowGuestAccess: true,
          },
        },
      })
    } catch {
      // 已配置时 configure 幂等，忽略
    }
    const session = await fetchAuthSession()
    _credentials = session.credentials
    return _credentials
  }

  // ── 调度凭证刷新 ────────────────────────────────────────────────────
  const _scheduleCredRefresh = () => {
    if (_credRefreshTimer) clearTimeout(_credRefreshTimer)
    _credRefreshTimer = null
    const expTs = _credentials?.expiration ? new Date(_credentials.expiration).getTime() : NaN
    if (!expTs || Number.isNaN(expTs)) return
    const refreshIn = expTs - Date.now() - credRefreshAhead
    if (refreshIn <= 0) return
    _credRefreshTimer = setTimeout(async () => {
      if (_destroyed) return
      try {
        await _fetchCredentials()
        // 断开旧连接，close 事件会触发重连逻辑
        _client?.end?.(true)
      } catch (e) {
        console.warn('[MqttClient] 凭证刷新失败', e)
      }
    }, refreshIn)
  }

  // ── 建立 mqtt.js 连接 ────────────────────────────────────────────────
  const _doConnect = async () => {
    if (_destroyed) return
    if (_client) return

    if (!_credentials?.accessKeyId || !_credentials?.secretAccessKey) {
      await _fetchCredentials()
    }
    if (!_credentials?.accessKeyId) return

    let wssUrl
    try {
      wssUrl = await getSignedMqttUrl(endpoint, region, _credentials)
    } catch (e) {
      console.error('[MqttClient] SigV4 签名失败', e)
      return
    }

    const clientId = `web_${Math.random().toString(16).slice(2)}`
    const client = mqtt.connect(wssUrl, {
      protocolVersion: 4,
      clean: true,
      connectTimeout: 30000,
      keepalive: 60,
      reconnectPeriod: 0,
      clientId,
    })
    _client = client

    client.on('connect', () => {
      if (_destroyed) return
      // 补订之前排队的 topic
      if (_pendingTopics.size) {
        const list = [..._pendingTopics]
        client.subscribe(list, { qos: 1 }, (err, granted) => {
          if (err) {
            console.error('[MqttClient] 订阅失败', err, { topics: list })
            return
          }
          console.log('[MqttClient] 订阅成功', granted)
        })
      }
      _scheduleCredRefresh()
      _emit('connect')
    })

    client.on('message', (topic, payload) => {
      if (_destroyed) return
      const raw = payload?.toString?.() || ''
      try {
        _emit('message', topic, JSON.parse(raw))
      } catch {
        _emit('message', topic, raw)
      }
    })

    client.on('error', (err) => {
      console.error('[MqttClient] mqtt.js error', err?.message || err, err)
      _emit('error', err)
      try { client.end(true) } catch { /* ignore */ }
    })

    client.on('close', () => {
      _client = null
      _emit('disconnect')
      if (!_destroyed) {
        clearTimeout(_reconnectTimer)
        _reconnectTimer = setTimeout(_doConnect, reconnectDelay)
      }
    })
  }

  // ── 公开 API ─────────────────────────────────────────────────────────

  /**
   * 获取凭证并建立 MQTT 连接
   * @returns {Promise<void>}
   */
  const connect = async () => {
    if (_destroyed) return
    await _fetchCredentials()
    await _doConnect()
  }

  /**
   * 订阅 topic 列表
   * @param {string[]} topics
   */
  const subscribe = (topics) => {
    const arr = Array.isArray(topics) ? topics : [topics]
    arr.forEach((t) => _pendingTopics.add(t))
    if (_client?.connected) {
      _client.subscribe(arr, { qos: 1 }, (err, granted) => {
        if (err) {
          console.error('[MqttClient] 订阅失败', err, { topics: arr })
          return
        }
        console.log('[MqttClient] 订阅成功', granted)
      })
    }
  }

  /**
   * 取消订阅 topic 列表
   * @param {string[]} topics
   */
  const unsubscribe = (topics) => {
    const arr = Array.isArray(topics) ? topics : [topics]
    arr.forEach((t) => _pendingTopics.delete(t))
    if (_client?.connected) {
      _client.unsubscribe(arr)
    }
  }

  /**
   * 注册事件监听器
   * @param {'message'|'connect'|'disconnect'|'error'} event
   * @param {Function} handler
   */
  const on = (event, handler) => {
    if (!_listeners[event]) _listeners[event] = []
    _listeners[event].push(handler)
  }

  /**
   * 移除事件监听器
   * @param {string} event
   * @param {Function} handler
   */
  const off = (event, handler) => {
    if (!_listeners[event]) return
    _listeners[event] = _listeners[event].filter((fn) => fn !== handler)
  }

  /**
   * 销毁客户端，释放所有资源
   */
  const destroy = () => {
    _destroyed = true
    clearTimeout(_reconnectTimer)
    clearTimeout(_credRefreshTimer)
    _reconnectTimer = null
    _credRefreshTimer = null
    if (_client) {
      try {
        _client.removeAllListeners?.()
        _client.end?.(true)
      } catch { /* ignore */ }
      _client = null
    }
    Object.keys(_listeners).forEach((k) => (_listeners[k] = []))
  }

  /**
   * 是否已连接
   * @returns {boolean}
   */
  const isReady = () => !!_client?.connected

  return { connect, subscribe, unsubscribe, on, off, destroy, isReady }
}
