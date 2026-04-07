// 验证前端 Cognito 凭证能否自发自收
// 如果自发自收成功但收不到后端消息，说明是 IoT Policy 隔离问题

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
  console.log('=== MQTT 诊断测试 ===\n');

  // 1. 获取凭证
  console.log('1. 获取 Cognito 凭证...');
  const session = await fetchAuthSession();
  const creds = session.credentials;
  console.log('   ✅ identityId:', session.identityId);

  // 2. 连接
  console.log('2. 连接 MQTT...');
  const wssUrl = getSignedUrl(IOT_ENDPOINT, IOT_REGION, creds);
  const client = mqtt.connect(wssUrl, {
    protocolVersion: 4, clean: true, connectTimeout: 10000, keepalive: 60, reconnectPeriod: 0
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('连接超时')), 10000);
    client.on('connect', () => { clearTimeout(t); resolve(); });
    client.on('error', (e) => { clearTimeout(t); reject(e); });
  });
  console.log('   ✅ 连接成功');

  // 3. 自发自收测试（test/# topic）
  console.log('\n3. 自发自收测试 (test/selftest)...');
  const selfTestResult = await new Promise((resolve) => {
    const topic = 'test/selftest/' + Date.now();
    const payload = JSON.stringify({ ping: true, ts: Date.now() });
    const t = setTimeout(() => resolve('TIMEOUT'), 8000);

    client.subscribe(topic, { qos: 0 }, () => {
      client.publish(topic, payload, { qos: 0 });
    });
    client.on('message', (t2, p) => {
      if (t2.startsWith('test/selftest/')) {
        clearTimeout(t);
        resolve('OK');
      }
    });
  });
  console.log(`   ${selfTestResult === 'OK' ? '✅' : '❌'} 自发自收: ${selfTestResult}`);

  // 4. 测试 trade topic 自发自收
  console.log('\n4. trade topic 自发自收测试...');
  // 先清除之前的 message listener
  client.removeAllListeners('message');

  const tradeTestResult = await new Promise((resolve) => {
    const topic = 'trade/evt-diag-test/sub-diag-test';
    const payload = JSON.stringify({
      type: 'trade', event_guid: 'evt-diag-test', sub_event_guid: 'sub-diag-test',
      trades: [{ trade_guid: 'trd-diag', outcome: 'YES', side: 'BUY', price: '0.65', shares: '50', trade_time: Math.floor(Date.now()/1000) }]
    });
    const t = setTimeout(() => resolve('TIMEOUT'), 8000);

    client.subscribe('trade/#', { qos: 0 }, () => {
      client.publish(topic, payload, { qos: 0 });
    });
    client.on('message', (t2, p) => {
      if (t2.startsWith('trade/')) {
        clearTimeout(t);
        resolve('OK');
      }
    });
  });
  console.log(`   ${tradeTestResult === 'OK' ? '✅' : '❌'} trade 自发自收: ${tradeTestResult}`);

  // 5. 测试 price topic
  client.removeAllListeners('message');
  console.log('\n5. price topic 自发自收测试...');
  const priceTestResult = await new Promise((resolve) => {
    const topic = 'price/evt-diag-test/sub-diag-test';
    const payload = JSON.stringify({ type: 'price_update', prices: { YES: [{ t: new Date().toISOString(), p: '0.65' }] } });
    const t = setTimeout(() => resolve('TIMEOUT'), 8000);

    client.subscribe('price/#', { qos: 0 }, () => {
      client.publish(topic, payload, { qos: 0 });
    });
    client.on('message', (t2) => {
      if (t2.startsWith('price/')) { clearTimeout(t); resolve('OK'); }
    });
  });
  console.log(`   ${priceTestResult === 'OK' ? '✅' : '❌'} price 自发自收: ${priceTestResult}`);

  // 6. 测试 orderbook topic
  client.removeAllListeners('message');
  console.log('\n6. orderbook topic 自发自收测试...');
  const obTestResult = await new Promise((resolve) => {
    const topic = 'orderbook/evt-diag-test/sub-diag-test';
    const payload = JSON.stringify({ type: 'orderbook' });
    const t = setTimeout(() => resolve('TIMEOUT'), 8000);

    client.subscribe('orderbook/#', { qos: 0 }, () => {
      client.publish(topic, payload, { qos: 0 });
    });
    client.on('message', (t2) => {
      if (t2.startsWith('orderbook/')) { clearTimeout(t); resolve('OK'); }
    });
  });
  console.log(`   ${obTestResult === 'OK' ? '✅' : '❌'} orderbook 自发自收: ${obTestResult}`);

  // 汇总
  console.log('\n=== 诊断结果 ===');
  const results = { 'test/*': selfTestResult, 'trade/*': tradeTestResult, 'price/*': priceTestResult, 'orderbook/*': obTestResult };
  const allOk = Object.values(results).every(r => r === 'OK');

  for (const [topic, result] of Object.entries(results)) {
    console.log(`  ${result === 'OK' ? '✅' : '❌'} ${topic}: ${result}`);
  }

  if (allOk) {
    console.log('\n✅ Cognito 凭证对所有 topic 都有 pub/sub 权限');
    console.log('   如果仍收不到后端消息，问题在后端 IoT 连接或撮合引擎未触发推送');
  } else {
    console.log('\n⚠️  部分 topic 自发自收失败');
    console.log('   检查 AWS IoT Core Policy 是否允许 Cognito 身份 pub/sub 这些 topic');
  }

  client.end();
  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
