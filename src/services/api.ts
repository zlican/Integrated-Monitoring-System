import type { CexMessage, CexMessagesResp, DexMessage, DexMessagesResp } from '@/types';
// CEX消息API服务
export class CexApiService {
  private static async fetchCexMessages(limit: number = 25): Promise<CexMessage[]> {
    //const url = `http://192.168.1.11:8888/api/latest-tg-messages?limit=${limit}`;
    const url = `http://10.4.26.198:8888/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }
  static async getLatestCexMessages(limit: number = 25): Promise<CexMessagesResp> {
    try {
      const raw = await this.fetchCexMessages(limit);
  
      type Aug = CexMessage & {
        _ts: number;
        _symbol: string;
        _direction: 'long' | 'short' | null;
        _isOneMinute: boolean;
      };
  
      const msgs: Aug[] = raw
        .map(m => {
          const symbol = extractSymbol(m.text);
          if (!symbol) return null;
          return {
            ...m,
            _ts: new Date(m.timestamp).getTime(),
            _symbol: symbol,
            _direction: extractDirection(m.text),
            _isOneMinute: m.text.includes('(1m)'), 
          };
        })
        .filter((x): x is Aug => !!x);
  
      // 升序扫描，保证先处理早期消息
      msgs.sort((a, b) => a._ts - b._ts);
  
      const kept: Aug[] = [];
      const state: Record<string, { direction: 'long' | 'short' | null; lastInvalid: number }> = {};
      const now = Date.now(); // 当前时间戳
      for (const m of msgs) {
        const symbol = m._symbol;
  
        if (isInvalidation(m.text)) {
          // 失效：清理 kept 中该 symbol 的历史消息
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol) kept.splice(i, 1);
          }
          // 更新状态
          state[symbol] = { direction: null, lastInvalid: m._ts };
          continue;
        }
        if (m._direction) {
          const st = state[symbol] ?? { direction: null, lastInvalid: -Infinity };

          // 如果消息是 (1m) 且超过6分钟（360秒），跳过
          if (m._isOneMinute && now - m._ts > 360_000) {
            continue;
          }

          // 如果方向和之前不一样，清理掉 kept 中该 symbol 的旧方向
          if (st.direction && st.direction !== m._direction) {
            for (let i = kept.length - 1; i >= 0; i--) {
              if (kept[i]._symbol === symbol) kept.splice(i, 1);
            }
          }
        
          // 如果消息时间在最后一次失效之前，则跳过
          if (m._ts <= st.lastInvalid) continue;
        
          // ✅ 如果已经存在相同方向的消息，先清理掉旧的
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol && kept[i]._direction === m._direction) {
              kept.splice(i, 1);
            }
          }
        
          // 更新状态
          state[symbol] = { direction: m._direction, lastInvalid: st.lastInvalid };
          kept.push(m);
        }
      }
  
      // 倒序返回
      kept.sort((a, b) => b._ts - a._ts);
          // ✅ 额外优化：若 BTCUSDT 或 ETHUSDT 存在，则只保留它们
    const hasBTC = kept.some(m => m._symbol === '_');
    const hasETH = kept.some(m => m._symbol === '_');

    let final = kept;
    if (hasBTC || hasETH) {
      final = kept.filter(m => m._symbol === '_' || m._symbol === '_');
    }
  
    const finalMessages: CexMessage[] = final.map(({ _ts, _symbol, _direction, ...rest }) => rest);

      return {
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };
    } catch (error) {
      console.error('获取CEX消息失败:', error);
      throw error;
    }
  }
  //长线
  private static async fetchCexMessagesL(limit: number = 25): Promise<CexMessage[]> {
    //const url = `http://192.168.1.11:8888/api/latest-tg-messages-long?limit=${limit}`;
    const url = `http://10.4.26.198:8888/api/latest-tg-messages-long?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }
  static async getLatestCexMessagesL(limit: number = 25): Promise<CexMessagesResp> {
    try {
      const raw = await this.fetchCexMessagesL(limit);
  
      type Aug = CexMessage & {
        _ts: number;
        _symbol: string;
        _direction: 'long' | 'short' | null;
      };
  
      const msgs: Aug[] = raw
        .map(m => {
          const symbol = extractSymbol(m.text);
          if (!symbol) return null;
          return {
            ...m,
            _ts: new Date(m.timestamp).getTime(),
            _symbol: symbol,
            _direction: extractDirection(m.text),
          };
        })
        .filter((x): x is Aug => !!x);
  
      // 升序扫描，保证先处理早期消息
      msgs.sort((a, b) => a._ts - b._ts);
  
      const kept: Aug[] = [];
      const state: Record<string, { direction: 'long' | 'short' | null; lastInvalid: number }> = {};
  
      for (const m of msgs) {
        const symbol = m._symbol;
  
        if (isInvalidation(m.text)) {
          // 失效：清理 kept 中该 symbol 的历史消息
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol) kept.splice(i, 1);
          }
          // 更新状态
          state[symbol] = { direction: null, lastInvalid: m._ts };
          continue;
        }
        if (m._direction) {
          const st = state[symbol] ?? { direction: null, lastInvalid: -Infinity };
        
          // 如果方向和之前不一样，清理掉 kept 中该 symbol 的旧方向
          if (st.direction && st.direction !== m._direction) {
            for (let i = kept.length - 1; i >= 0; i--) {
              if (kept[i]._symbol === symbol) kept.splice(i, 1);
            }
          }
        
          // 如果消息时间在最后一次失效之前，则跳过
          if (m._ts <= st.lastInvalid) continue;
        
          // ✅ 如果已经存在相同方向的消息，先清理掉旧的
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol && kept[i]._direction === m._direction) {
              kept.splice(i, 1);
            }
          }
        
          // 更新状态
          state[symbol] = { direction: m._direction, lastInvalid: st.lastInvalid };
          kept.push(m);
        }
      }
  
      // 倒序返回
      kept.sort((a, b) => b._ts - a._ts);
          // ✅ 额外优化：若 BTCUSDT 或 ETHUSDT 存在，则只保留它们
    const hasBTC = kept.some(m => m._symbol === '_');
    const hasETH = kept.some(m => m._symbol === '_');

    let final = kept;
    if (hasBTC || hasETH) {
      final = kept.filter(m => m._symbol === '_' || m._symbol === '_');
    }
  
    const finalMessages: CexMessage[] = final.map(({ _ts, _symbol, _direction, ...rest }) => rest);

      return {
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };
    } catch (error) {
      console.error('获取CEX消息失败:', error);
      throw error;
    }
  }


  
}
function extractSymbol(text: string): string | null {
  const m = text.match(/([A-Z0-9]{2,}USDT)\b/);
  return m ? m[1] : null;
}
function isInvalidation(text: string): boolean {
  return text.includes('信号失效');
}
function extractDirection(text: string): 'long' | 'short' | null {
  if (text.includes('做多')) return 'long';
  if (text.includes('做空')) return 'short';
  return null;
}
// DEX消息API服务
export class DexApiService {
  private static async fetchDexMessages(limit: number = 25): Promise<DexMessage[]> {
    //const url = `http://192.168.1.11:8889/api/latest-tg-messages?limit=${limit}`;
    const url = `http://10.4.26.198:8889/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求DEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }
  static async getLatestDexMessages(limit: number = 25): Promise<DexMessagesResp> {
    try {
      const raw = await this.fetchDexMessages(limit);
  
      type Aug = DexMessage & {
        _ts: number;
        _symbol: string;
      };
  
      // 预处理：抽取 symbol + 时间戳
      const msgs: Aug[] = raw
        .map(m => {
          let symbol: string | null = null;
  
          if (m.text.startsWith('⚠️信号失效')) {
            // 失效消息：冒号或全角冒号后的 symbol
            const match = m.text.match(/[:：]\s*([A-Z0-9]+)/i);
            if (match) symbol = match[1].toUpperCase();
          } else {
            // 普通信号：开头的🟢/⚠️ + 字母数字
            const match = m.text.match(/^[⚠️🟢]*\s*([A-Z0-9]+)/i);
            if (match) symbol = match[1].toUpperCase();
          }
  
          if (!symbol) return null;
  
          return {
            ...m,
            _ts: new Date(m.timestamp).getTime(),
            _symbol: symbol,
          };
        })
        .filter((x): x is Aug => !!x);
  
      // 升序扫描，保证先处理早期消息
      msgs.sort((a, b) => a._ts - b._ts);
  
      const kept: Aug[] = [];
      const state: Record<string, { lastInvalid: number }> = {};
  
      for (const m of msgs) {
        const symbol = m._symbol;
  
        if (m.text.startsWith('⚠️信号失效')) {
          // 失效：清理 kept 中该 symbol 的历史消息
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol) kept.splice(i, 1);
          }
          // 更新状态
          state[symbol] = { lastInvalid: m._ts };
          continue;
        }
  
        const st = state[symbol] ?? { lastInvalid: -Infinity };
        // 如果消息时间在最后一次失效之前 → 跳过
        if (m._ts <= st.lastInvalid) continue;
        
        // ✅ 保证同一个 symbol 只保留最新的
        for (let i = kept.length - 1; i >= 0; i--) {
          if (kept[i]._symbol === symbol) kept.splice(i, 1);
        }
        
        kept.push(m);
      }
  
      // 倒序返回
      kept.sort((a, b) => b._ts - a._ts);
  
      const finalMessages: DexMessage[] = kept.map(({ _ts, _symbol, ...rest }) => rest);
  
      return {
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };
    } catch (error) {
      console.error('获取DEX消息失败:', error);
      throw error;
    }
  }
}
