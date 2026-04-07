// 跨客户端验证：前端 Cognito 订阅 + 后端证书发布
// 前端先订阅，然后后端通过 Go 测试发布，看前端能否收到

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
  console.log('=== 跨客户端推送验证 ===\n');
  console.log('前端(Cognito WSS) 订阅 → 等待后端(TLS证书) 发布\n');

  const session = await fetchAuthSession();
  const creds = session.credentials;
  const wssUrl = getSignedUrl(IOT_ENDPOINT, IOT_REGION, creds);
  const client = mqtt.connect(wssUrl, {
    protocolVersion: 4, clean: true, connectTimeout: 10000, keepalive: 60, reconnectPeriod: 0
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('连接超时')), 10000);
    client.on('connect', () => { clearTimeout(t); resolve(); });
    client.on('error', (e) => { clearTimeout(t); reject(e); });
  });
  console.log('✅ MQTT 连接成功');

  const TOPICS = ['trade/#', 'price/#', 'orderbook/#', 'user/#'];
  await new Promise((resolve, reject) => {
    client.subscribe(TOPICS, { qos: 1 }, (err) => {
      if (err) reject(err); else resolve();
    });
  });
  console.log('✅ 已订阅:', TOPICS.join(', '));
  console.log('\n⏳ 等待后端推送（20秒）...');
  console.log('   请在另一个终端运行:');
  console.log('   go test -v -run TestMQTTEndToEndPublish -count=1 ./services/iot/...\n');

  let msgCount = 0;
  const received = new Set();

  client.on('message', (topic, payload) => {
    msgCount++;
    const ts = new Date().toISOString().slice(11, 19);
    try {
      const data = JSON.parse(payload.toString());
      received.add(data.type);
      console.log(`   [${ts}] #${msgCount} [${topic}] type=${data.type} ✅`);
    } catch {
      console.log(`   [${ts}] #${msgCount} [${topic}] raw`);
    }
  });

  await new Promise(resolve => setTimeout(resolve, 20000));

  console.log(`\n=== 结果: 收到 ${msgCount} 条消息 ===`);
  if (msgCount > 0) {
    console.log('收到的消息类型:', [...received].join(', '));
    console.log('✅ 跨客户端推送验证通过！后端 → AWS IoT Core → 前端 链路正常');
  } else {
    console.log('❌ 未收到后端消息');
    console.log('   可能原因: 后端 Go 测试未运行，或 AWS IoT Core 路由策略隔离了不同认证方式的客户端');
  }

  client.end();
  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
