// 快速 MQTT 推送验证脚本
// 用法: node test_mqtt_quick.mjs

import WebSocket from 'ws';
globalThis.WebSocket = WebSocket;

import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import mqtt from 'mqtt';
import crypto from 'crypto';

const IOT_ENDPOINT = 'a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com';
const IOT_REGION = 'ap-southeast-1';
const COGNITO_IDENTITY_POOL_ID = 'ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf';

Amplify.configure({
  Auth: { Cognito: { identityPoolId: COGNITO_IDENTITY_POOL_ID, allowGuestAccess: true } }
});

function getSignedUrl(endpoint, region, creds) {
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
  const canonicalRequest = ['GET', '/mqtt', canonicalQuerystring, `host:${endpoint}\n`, 'host',
    crypto.createHash('sha256').update('').digest('hex')].join('\n');
  const stringToSign = [algorithm, amzDate, credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
  const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${creds.secretAccessKey}`, dateStamp), region), service), 'aws4_request');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  let url = `wss://${endpoint}/mqtt?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
  if (creds.sessionToken) url += `&X-Amz-Security-Token=${encodeURIComponent(creds.sessionToken)}`;
  return url;
}

async function main() {
  console.log('1. 获取 Cognito 凭证...');
  const session = await fetchAuthSession();
  const creds = session.credentials;
  console.log('   ✅ 凭证获取成功, identityId:', session.identityId);

  console.log('2. 连接 AWS IoT Core MQTT...');
  const wssUrl = getSignedUrl(IOT_ENDPOINT, IOT_REGION, creds);
  const client = mqtt.connect(wssUrl, {
    protocolVersion: 4, clean: true, connectTimeout: 10000, keepalive: 60, reconnectPeriod: 0
  });

  const TOPICS = ['price/#', 'orderbook/#', 'trade/#', 'orders/#', 'user/#'];
  let msgCount = 0;

  client.on('connect', () => {
    console.log('   ✅ MQTT 连接成功!');
    client.subscribe(TOPICS, { qos: 0 }, (err) => {
      if (err) { console.error('   ❌ 订阅失败:', err.message); return; }
      console.log('   ✅ 已订阅:', TOPICS.join(', '));
      console.log('3. 监听后端推送消息（30秒）...\n');
    });
  });

  client.on('error', (err) => console.error('   ❌ MQTT 错误:', err.message));

  client.on('message', (topic, payload) => {
    msgCount++;
    const ts = new Date().toISOString().slice(11, 19);
    try {
      const data = JSON.parse(payload.toString());
      console.log(`   [${ts}] #${msgCount} [${topic}] type=${data.type}`);
      if (data.type === 'trade') console.log(`          trades: ${data.trades?.length} 笔`);
      if (data.type === 'price_update') console.log(`          outcomes: ${Object.keys(data.prices || {}).join(', ')}`);
      if (data.type === 'orderbook') {
        const yesAsks = data.YES?.asks?.length || 0;
        const noAsks = data.NO?.asks?.length || 0;
        console.log(`          YES asks:${yesAsks} NO asks:${noAsks}`);
      }
      if (data.type === 'user_order') console.log(`          order: ${data.order?.status}`);
      if (data.type === 'user_position') console.log(`          positions: ${data.positions?.length}`);
    } catch {
      console.log(`   [${ts}] #${msgCount} [${topic}] raw: ${payload.toString().slice(0, 100)}`);
    }
  });

  // 30秒后退出
  setTimeout(() => {
    console.log(`\n=== 测试结束: 30秒内收到 ${msgCount} 条消息 ===`);
    if (msgCount === 0) {
      console.log('⚠️  未收到任何消息。可能原因:');
      console.log('   - 后端没有活跃的交易（没有订单在撮合）');
      console.log('   - MQTT 连接到 AWS IoT Core 但后端未推送');
      console.log('   - 后端 IoT 服务未启动或证书问题');
    } else {
      console.log('✅ MQTT 推送链路正常!');
    }
    client.end();
    process.exit(0);
  }, 30000);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
