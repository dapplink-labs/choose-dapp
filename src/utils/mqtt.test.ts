// Node.js 环境需要 WebSocket polyfill
import WebSocket from 'ws';
(globalThis as any).WebSocket = WebSocket;

import { Amplify } from 'aws-amplify';
import * as crypto from 'crypto';

/**
 * AWS IoT MQTT 测试
 *
 * 使用方式:
 *   npx jest mqtt.test.ts --verbose --forceExit          # 快速测试（自发自收后退出）
 *   LISTEN=1 npx jest mqtt.test.ts --verbose --forceExit  # 长连接模式（持续监听）
 */

// ============ 配置区 ============
const IOT_REGION = 'ap-southeast-1';
const IOT_ENDPOINT = 'a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com';
const COGNITO_IDENTITY_POOL_ID = 'ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf';
const TOPICS = ['price/#', 'orderbook/#', 'trade/#', 'orders/#', 'user/#', 'test/#'];

// LISTEN=1 开启长连接模式，持续监听不退出
const LISTEN_MODE = process.env.LISTEN === '1';
// 长连接监听时长（秒），0 = 永不超时（需 Ctrl+C 退出）
const LISTEN_DURATION = parseInt(process.env.LISTEN_DURATION || '0', 10);
// ================================

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: COGNITO_IDENTITY_POOL_ID,
      allowGuestAccess: true,
    }
  }
});

let credentials: any;
let currentIdentityId: string | undefined;

// SigV4 签名生成 WSS URL
function getSignedUrl(endpoint: string, region: string, creds: any): string {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 8);
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const service = 'iotdevicegateway';
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalQuerystring = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${encodeURIComponent(creds.accessKeyId + '/' + credentialScope)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-SignedHeaders=host`,
  ].sort().join('&');

  const canonicalRequest = [
    'GET', '/mqtt', canonicalQuerystring,
    `host:${endpoint}\n`, 'host',
    crypto.createHash('sha256').update('').digest('hex'),
  ].join('\n');

  const stringToSign = [
    algorithm, amzDate, credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const hmac = (key: any, data: string) => crypto.createHmac('sha256', key).update(data).digest();
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${creds.secretAccessKey}`, dateStamp), region), service), 'aws4_request');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  let url = `wss://${endpoint}/mqtt?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
  if (creds.sessionToken) {
    url += `&X-Amz-Security-Token=${encodeURIComponent(creds.sessionToken)}`;
  }
  return url;
}

function ts(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function createMqttClient() {
  const mqtt = require('mqtt');
  const wssUrl = getSignedUrl(IOT_ENDPOINT, IOT_REGION, credentials);
  return mqtt.connect(wssUrl, {
    protocolVersion: 4,
    clean: true,
    connectTimeout: 10000,
    keepalive: 60,
    reconnectPeriod: 0,
  });
}

describe('MQTT 测试', () => {

  // Step 1: Cognito 凭证
  test('1. 获取 Cognito 凭证', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    currentIdentityId = session.identityId;
    credentials = session.credentials;

    console.log('identityId:', currentIdentityId);
    expect(credentials).toBeDefined();
  }, 20000);

  // Step 2: 自发自收验证
  test('2. mqtt.js 自发自收测试', async () => {
    const client = createMqttClient();

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.end(true);
        reject(new Error('MQTT 连接或消息接收超时 (15s)'));
      }, 15000);

      client.on('error', (err: any) => console.error('MQTT 错误:', err.message));

      client.on('connect', () => {
        console.log('MQTT 连接成功!');
        const testTopic = 'test/selftest/' + Date.now();
        const testMsg = JSON.stringify({ action: 'ping', ts: Date.now() });

        client.subscribe(testTopic, { qos: 0 }, (err: any) => {
          if (err) { clearTimeout(timeout); client.end(); reject(err); return; }
          console.log('已订阅:', testTopic);
          client.publish(testTopic, testMsg, { qos: 0 }, (err: any) => {
            if (err) console.error('发布失败:', err.message);
            else console.log('已发布，等待接收...');
          });
        });
      });

      client.on('message', (topic: string, payload: Buffer) => {
        clearTimeout(timeout);
        console.log(`收到消息 [${topic}]:`, payload.toString());
        client.end();
        resolve();
      });
    });
  }, 20000);

  // Step 3: 发布模拟业务消息
  test('3. 发布并接收模拟 trade 消息', async () => {
    const client = createMqttClient();
    const topic = 'trade/evt_test/sub_test';
    const tradeMsg = {
      type: 'trade',
      event_guid: 'evt_test',
      sub_event_guid: 'sub_test',
      trades: [
        {
          trade_guid: 'trd_' + Date.now(),
          outcome: 'YES',
          side: 'BUY',
          price: '0.65',
          shares: '50.00',
          trade_time: Math.floor(Date.now() / 1000),
        }
      ],
    };

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.end(true);
        reject(new Error('未收到模拟 trade 消息'));
      }, 15000);

      client.on('connect', () => {
        client.subscribe('trade/#', { qos: 0 }, (err: any) => {
          if (err) { clearTimeout(timeout); client.end(); reject(err); return; }
          console.log('已订阅 trade/#');
          client.publish(topic, JSON.stringify(tradeMsg), { qos: 0 });
          console.log('已发布模拟 trade 消息');
        });
      });

      client.on('error', (err: any) => console.error('错误:', err.message));

      client.on('message', (t: string, payload: Buffer) => {
        clearTimeout(timeout);
        const data = JSON.parse(payload.toString());
        console.log(`收到 trade 消息 [${t}]:`, JSON.stringify(data, null, 2));
        expect(data.type).toBe('trade');
        expect(data.trades[0].outcome).toBe('YES');
        client.end();
        resolve();
      });
    });
  }, 20000);

  // Step 4: 长连接监听（LISTEN=1 时启用）
  const listenTest = LISTEN_MODE ? test : test.skip;
  listenTest('4. 长连接监听所有 topic', async () => {
    const client = createMqttClient();
    let msgCount = 0;

    console.log('\n==========================================');
    console.log(' 长连接模式已启用');
    console.log(` Topics: ${TOPICS.join(', ')}`);
    if (LISTEN_DURATION > 0) {
      console.log(` 监听时长: ${LISTEN_DURATION}s`);
    } else {
      console.log(' 监听时长: 无限制 (Ctrl+C 退出)');
    }
    console.log('==========================================\n');

    return new Promise<void>((resolve, reject) => {
      // 凭证过期前主动刷新重连
      const expiration = (credentials as any).expiration;
      let refreshTimer: NodeJS.Timeout | undefined;

      if (expiration) {
        const refreshIn = new Date(expiration).getTime() - Date.now() - 5 * 60 * 1000;
        if (refreshIn > 0) {
          refreshTimer = setTimeout(async () => {
            console.log(`\n[${ts()}] 凭证即将过期，刷新中...`);
            try {
              const { fetchAuthSession } = await import('aws-amplify/auth');
              const session = await fetchAuthSession();
              credentials = session.credentials;
              currentIdentityId = session.identityId;

              console.log(`[${ts()}] 凭证已刷新，断开旧连接...`);
              client.end(true);
              // close 事件会触发重连
            } catch (err: any) {
              console.error(`[${ts()}] 凭证刷新失败:`, err.message);
            }
          }, refreshIn);
        }
      }

      // 定时退出（如果设置了 LISTEN_DURATION）
      if (LISTEN_DURATION > 0) {
        setTimeout(() => {
          console.log(`\n[${ts()}] 监听时间到 (${LISTEN_DURATION}s)，共收到 ${msgCount} 条消息`);
          if (refreshTimer) clearTimeout(refreshTimer);
          client.end();
          resolve();
        }, LISTEN_DURATION * 1000);
      }

      client.on('error', (err: any) => {
        console.error(`[${ts()}] MQTT 错误:`, err.message);
      });

      client.on('close', () => {
        console.log(`[${ts()}] 连接断开`);
        // 自动重连（刷新签名）
        setTimeout(() => {
          console.log(`[${ts()}] 重新连接...`);
          const mqtt = require('mqtt');
          const newUrl = getSignedUrl(IOT_ENDPOINT, IOT_REGION, credentials);
          const newClient = mqtt.connect(newUrl, {
            protocolVersion: 4,
            clean: true,
            connectTimeout: 10000,
            keepalive: 60,
            reconnectPeriod: 0,
          });
          // 复用事件处理
          newClient.on('connect', onConnect);
          newClient.on('message', onMessage);
          newClient.on('error', (err: any) => console.error(`[${ts()}] MQTT 错误:`, err.message));
        }, 2000);
      });

      function onConnect() {
        console.log(`[${ts()}] MQTT 连接成功`);
        for (const topic of TOPICS) {
          client.subscribe(topic, { qos: 0 }, (err: any) => {
            if (err) console.error(`[${ts()}] 订阅失败 ${topic}:`, err.message);
            else console.log(`[${ts()}] 已订阅: ${topic}`);
          });
        }
        console.log(`\n[${ts()}] 等待消息中...\n`);
      }

      function onMessage(topic: string, payload: Buffer) {
        msgCount++;
        const raw = payload.toString();
        try {
          const data = JSON.parse(raw);
          const type = data.type || 'unknown';

          // 直接写 stdout 绕过 jest 缓冲，实时展示
          const w = process.stdout.write.bind(process.stdout);
          const C = { reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', magenta: '\x1b[35m', gray: '\x1b[90m', white: '\x1b[37m', bold: '\x1b[1m' };
          const typeColor: Record<string, string> = {
            price_update: C.green, orderbook: C.cyan, trade: C.yellow,
            user_position: C.magenta, user_order: C.magenta,
          };
          const tc = typeColor[type] || C.white;

          w(`\n${C.gray}──────────────────────────────────────────${C.reset}\n`);
          w(`${C.bold}#${msgCount}${C.reset} ${C.gray}${ts()}${C.reset}  ${tc}${type}${C.reset}  ${C.gray}${topic}${C.reset}\n`);

          // 按消息类型格式化关键字段
          if (type === 'price_update' && data.prices) {
            for (const [outcome, points] of Object.entries(data.prices) as any) {
              const arr = Array.isArray(points) ? points : [points];
              arr.forEach((pt: any) => {
                w(`  ${C.bold}${outcome}${C.reset}  t=${C.gray}${pt.t}${C.reset}  p=${C.green}${pt.p}${C.reset}\n`);
              });
            }
          } else if (type === 'orderbook') {
            const printSide = (label: string, color: string, levels: any[]) => {
              if (!levels?.length) return;
              w(`  ${color}${label}${C.reset} (${levels.length} levels)\n`);
              levels.slice(0, 5).forEach((l: any) => w(`    ${l.price}  size=${l.size}  orders=${l.orders}  amount=${l.amount}\n`));
              if (levels.length > 5) w(`    ... +${levels.length - 5} more\n`);
            };
            for (const side of ['YES', 'NO']) {
              const ob = data[side];
              if (!ob) continue;
              w(`  ${C.bold}${side}${C.reset}\n`);
              printSide('ASKS', C.yellow, ob.asks);
              printSide('BIDS', C.green, ob.bids);
            }
          } else if (type === 'trade' && data.trades) {
            data.trades.forEach((t: any) => {
              w(`  ${t.side === 'BUY' ? C.green : C.yellow}${t.side}${C.reset} ${t.outcome}  price=${C.bold}${t.price}${C.reset}  shares=${t.shares}\n`);
            });
          } else if (type === 'user_position' && data.positions) {
            data.positions.forEach((p: any) => {
              const pnlColor = parseFloat(p.unrealized_pnl || '0') >= 0 ? C.green : C.yellow;
              w(`  ${C.bold}${p.outcome}${C.reset}  shares=${p.shares}  avg=${p.avg_price}  cur=${p.current_price}  bet=${p.bet_amount}  val=${p.position_value}  pnl=${pnlColor}${p.unrealized_pnl}${C.reset}  roi=${p.roi}%\n`);
            });
          } else if (type === 'user_order' && data.order) {
            const o = data.order;
            w(`  ${C.bold}${o.order_guid}${C.reset}  ${o.side} ${o.order_type} ${C.bold}${o.status}${C.reset}  price=${o.price}  size=${o.size}  filled=${o.filled_size}  remaining=${o.remaining_size}  fee=${o.fee}\n`);
          } else {
            // 其他类型直接打印 JSON
            w(JSON.stringify(data, null, 2) + '\n');
          }
        } catch {
          process.stdout.write(`[${ts()}] #${msgCount} [raw] ${topic}: ${raw}\n`);
        }
      }

      client.on('connect', onConnect);
      client.on('message', onMessage);

      // 永不超时模式：不 resolve，靠 Ctrl+C 或 LISTEN_DURATION 退出
      if (LISTEN_DURATION <= 0) {
        // jest --forceExit 会在进程退出时强制结束
      }
    });
  }, LISTEN_DURATION > 0 ? (LISTEN_DURATION + 10) * 1000 : 24 * 60 * 60 * 1000); // 最长 24 小时
});
