/** 首页/列表等入口禁止进入交易详情的事件 GUID（暂未开放） */
const BLOCKED_TRADE_EVENT_GUIDS = new Set([
    '29e94454-276b-46a3-a853-d0098fb2ac2f',
    'e35a5c05-e78d-47c8-897b-6c3927432453',
    '8c84377f-7bf2-4332-be18-81b752879386',
].map((x) => String(x).toLowerCase()));

export function isTradeBlockedForEvent(eventGuid) {
    if (eventGuid == null || eventGuid === '') return false;
    return BLOCKED_TRADE_EVENT_GUIDS.has(String(eventGuid).toLowerCase());
}
