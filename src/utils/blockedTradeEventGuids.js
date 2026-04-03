/** 首页/列表等入口禁止进入交易详情的事件 GUID（暂未开放） */
const BLOCKED_TRADE_EVENT_GUIDS = new Set([
    '89254dac-d8ac-4752-b947-e90d754d8acd',
    'b3758b46-f051-44bc-9b12-452756af5a33',
    '4fb146d2-f860-4196-a8d4-f20fb7fab687',
].map((x) => String(x).toLowerCase()));

export function isTradeBlockedForEvent(eventGuid) {
    if (eventGuid == null || eventGuid === '') return false;
    return BLOCKED_TRADE_EVENT_GUIDS.has(String(eventGuid).toLowerCase());
}
