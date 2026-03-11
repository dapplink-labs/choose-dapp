# MQTT 测试指南

## 概述

基于 AWS IoT Core + Cognito 匿名身份池，通过 WebSocket (SigV4 签名) 连接 MQTT broker，订阅和接收业务消息推送。

## 连接配置

| 配置项 | 值 |
|--------|-----|
| Region | `ap-southeast-1` |
| Endpoint | `a3awip9q9thtco-ats.iot.ap-southeast-1.amazonaws.com` |
| Cognito Identity Pool | `ap-southeast-1:ec400695-b709-4af1-a19b-455cded69acf` |

### 连接参数

```
协议:           MQTT v3.1.1 over WebSocket (wss://)
端口:           443 (WebSocket)
签名方式:       AWS SigV4
认证方式:       Cognito 匿名身份池 (Guest Access)
keepalive:      60s
connectTimeout: 10s
clean session:  true
QoS:            0
```

## Topic 列表

| Topic 模式 | 说明 | 消息类型 |
|------------|------|----------|
| `price/#` | 价格走势推送 | `price_update` |
| `orderbook/#` | 订单簿快照推送 | `orderbook` |
| `trade/#` | 成交推送 | `trade` |
| `orders/#` | 用户订单状态推送 | `user_order` |
| `user/#` | 用户持仓推送 | `user_position` |
| `test/#` | 测试用 topic | - |

### Topic 格式

```
trade/{event_guid}/{sub_event_guid}
price/{event_guid}/{sub_event_guid}
orderbook/{event_guid}/{sub_event_guid}
orders/{user_guid}
user/{user_guid}/positions
```

## 消息格式

### price_update

Topic: `price/{event_guid}/{sub_event_guid}`
更新策略: 增量，prices 按 outcome 分组，每个 outcome 为 `[{t, p}]` 数组（1秒内多笔合并）

```json
{
  "type": "price_update",
  "event_guid": "evt_test",
  "sub_event_guid": "sub_test",
  "prices": {
    "YES": [{ "t": "2026-03-10T12:00:00Z", "p": "0.65" }],
    "NO":  [{ "t": "2026-03-10T12:00:00Z", "p": "0.35" }]
  }
}
```

### orderbook

Topic: `orderbook/{event_guid}/{sub_event_guid}`
更新策略: 全量快照，前端直接覆盖，同时包含 YES/NO 两个方向

```json
{
  "type": "orderbook",
  "event_guid": "evt_test",
  "sub_event_guid": "sub_test",
  "YES": {
    "asks": [{ "price": "0.65", "size": "100.00", "orders": 1, "amount": "65.00" }],
    "bids": [{ "price": "0.60", "size": "50.00",  "orders": 1, "amount": "30.00" }]
  },
  "NO": {
    "asks": [{ "price": "0.40", "size": "50.00",  "orders": 1, "amount": "20.00" }],
    "bids": [{ "price": "0.35", "size": "100.00", "orders": 1, "amount": "35.00" }]
  }
}
```

### trade

Topic: `trade/{event_guid}/{sub_event_guid}`
更新策略: 增量，trades 为数组（1秒内多笔合并）

```json
{
  "type": "trade",
  "event_guid": "evt_test",
  "sub_event_guid": "sub_test",
  "trades": [
    {
      "trade_guid": "trd_xxx",
      "outcome": "YES",
      "side": "BUY",
      "price": "0.65",
      "shares": "50.00",
      "trade_time": 1700000000
    }
  ]
}
```

### user_order

Topic: `orders/{user_guid}`
更新策略: 单条订单状态更新

```json
{
  "type": "user_order",
  "user_guid": "usr_xxx",
  "order": {
    "order_guid": "ord_xxx",
    "event_guid": "evt_test",
    "sub_event_guid": "sub_test",
    "side": "BUY",
    "order_type": "limit",
    "status": "FILLED",
    "price": "0.65",
    "size": "50",
    "filled_size": "50",
    "remaining_size": "0",
    "fee": "0.50"
  }
}
```

### user_position

Topic: `user/{user_guid}/positions`
更新策略: 用户所有持仓全量快照

```json
{
  "type": "user_position",
  "timestamp": 1700000000,
  "user_guid": "usr_xxx",
  "positions": [
    {
      "event_guid": "evt_test",
      "sub_event_guid": "sub_test",
      "outcome": "YES",
      "shares": "100",
      "avg_price": "0.60",
      "current_price": "0.65",
      "bet_amount": "60.00",
      "position_value": "65.00",
      "unrealized_pnl": "5.00",
      "realized_pnl": "0.00",
      "roi": "8.33",
      "updated_at": 1700000000
    }
  ]
}
```

## 脚本说明

所有脚本位于 `script/` 目录下。

### 1. mqtt.test.ts — Jest 测试脚本

包含 4 个测试用例：

| 测试 | 说明 |
|------|------|
| 1. 获取 Cognito 凭证 | 获取匿名凭证并 attach IoT 策略 |
| 2. 自发自收测试 | 发布到 `test/selftest/*`，验证能收到自己的消息 |
| 3. 模拟 trade 消息 | 发布到 `trade/evt_test/sub_test`，验证消息格式 |
| 4. 长连接监听 | `LISTEN=1` 时启用，持续监听所有 topic |

#### 运行方式

```bash
cd script

# 安装依赖
npm install

# 快速测试（自发自收后退出）
npx jest mqtt.test.ts --verbose --forceExit

# 长连接模式（持续监听，Ctrl+C 退出）
LISTEN=1 npx jest mqtt.test.ts --verbose --forceExit

# 长连接 + 限时（监听 300 秒后自动退出）
LISTEN=1 LISTEN_DURATION=300 npx jest mqtt.test.ts --verbose --forceExit

# 长链接 + 永远不退出
LISTEN=1 npx --prefix script jest --config script/jest.config.js --rootDir script --verbose --forceExit mqtt.test.ts
```


## 连接流程

```
1. fetchAuthSession() → 获取 Cognito 匿名临时凭证 (accessKeyId, secretAccessKey, sessionToken)
2. SigV4 签名生成 WSS URL → wss://{endpoint}/mqtt?X-Amz-Algorithm=...&X-Amz-Signature=...
3. mqtt.connect(wssUrl) → 建立 WebSocket 连接
4. client.subscribe(topics) → 订阅 topic
5. client.on('message') → 接收消息
```

## 项目依赖

```json
{
  "aws-amplify": "^6",
  "@aws-sdk/client-iot": "^3",
  "mqtt": "^5.15.0",
  "ws": "^8.19.0",
  "ts-jest": "^29",
  "typescript": "^5"
}
```

## 注意事项

- Cognito 临时凭证有效期约 1 小时，长连接需要定时刷新
- `mqtt.test.ts` 使用新加坡区配置
- QoS 0 不保证消息送达，适用于实时行情类推送
