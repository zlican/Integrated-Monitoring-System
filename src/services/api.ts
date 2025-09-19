import type { CexMessage, CexMessagesResp, DexMessage, DexMessagesResp } from '@/types';
// CEX消息API服务
const ip = "192.168.1.9"

export class CexApiService {
  private static async fetchCexMessages(limit: number = 25): Promise<CexMessage[]> {
    const url = `http://${ip}:8888/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }
  static async getLatestCexMessages(limit: number = 25): Promise<CexMessagesResp> {
    try {
      // 并行获取 cex 消息和 ban list
      const [raw, banList]: [CexMessage[], string[]] = await Promise.all([
        this.fetchCexMessages(limit),
        fetch("http://192.168.1.9:9001/cex/ban/list")
          .then(res => res.json())
          .catch(() => []),
      ]);
  
      type Aug = CexMessage & {
        _ts: number;
        _symbol: string;
        _direction: "long" | "short" | null;
        _isOneMinute: boolean;
      };
  
      // ban 转大写，放到 Set 里加快判断
      const banned = new Set(banList.map(s => s.toUpperCase()));
  
      const msgs: Aug[] = raw
        .map(m => {
          const symbol = extractSymbol(m.text);
          if (!symbol) return null;
          if (banned.has(symbol)) return null; // 🚫 ban 标的直接过滤
  
          return {
            ...m,
            _ts: new Date(m.timestamp).getTime(),
            _symbol: symbol,
            _direction: extractDirection(m.text),
            _isOneMinute: m.text.includes("(1m)"),
          };
        })
        .filter((x): x is Aug => !!x);
  
      // 升序扫描
      msgs.sort((a, b) => a._ts - b._ts);
  
      const kept: Aug[] = [];
      const state: Record<string, { direction: "long" | "short" | null; lastInvalid: number }> = {};
      const now = Date.now();
  
      for (const m of msgs) {
        const symbol = m._symbol;
  
        if (isInvalidation(m.text)) {
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol) kept.splice(i, 1);
          }
          state[symbol] = { direction: null, lastInvalid: m._ts };
          continue;
        }
  
        if (m._direction) {
          const st = state[symbol] ?? { direction: null, lastInvalid: -Infinity };
  
          // (1m) 且超过 6 分钟，跳过
          if (m._isOneMinute && now - m._ts > 360_000) {
            continue;
          }
      // 🚫 新增：任何消息超过 10 分钟跳过
      if (now - m._ts > 600_000) {
        continue;
      }
          // 新方向不同 → 清理旧方向
          if (st.direction && st.direction !== m._direction) {
            for (let i = kept.length - 1; i >= 0; i--) {
              if (kept[i]._symbol === symbol) kept.splice(i, 1);
            }
          }
  
          // 在最后一次失效之前 → 跳过
          if (m._ts <= st.lastInvalid) continue;
  
          // 清理掉同方向旧消息
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol && kept[i]._direction === m._direction) {
              kept.splice(i, 1);
            }
          }
  
          state[symbol] = { direction: m._direction, lastInvalid: st.lastInvalid };
          kept.push(m);
        }
      }
  
// 倒序返回
kept.sort((a, b) => b._ts - a._ts);

const FIFTEEN_MIN = 10 * 60 * 1000;
const cutoff = now - FIFTEEN_MIN;

// 查找最近 10 分钟内的 BTC/ETH 做空消息
const hasRecentBTCShort = kept.some(
  m => m._symbol === 'BTCUSDT' && m._direction === 'short' && m._ts >= cutoff
);
const hasRecentETHShort = kept.some(
  m => m._symbol === 'ETHUSDT' && m._direction === 'short' && m._ts >= cutoff
);

let final = kept;

if (hasRecentBTCShort || hasRecentETHShort) {
  // 🚫 只保留 BTC/ETH 做空的消息
  final = kept.filter(
    m =>
      (m._symbol === 'BTCUSDT' || m._symbol === 'ETHUSDT') &&
      m._direction === 'short' &&
      m._ts >= cutoff
  );
} 
  
      const finalMessages: CexMessage[] = final.map(
        ({ _ts, _symbol, _direction, _isOneMinute, ...rest }) => rest
      );
  
      return {
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };
    } catch (error) {
      console.error("获取CEX消息失败:", error);
      throw error;
    }
  }
  
  //中线
  private static async fetchCexMessagesL(limit: number = 25): Promise<CexMessage[]> {
    const url = `http://${ip}:8888/api/latest-tg-messages-long?limit=${limit}`;
    //const url = `http://192.168.1.102:8888/api/latest-tg-messages-long?limit=${limit}`;
    //const url = `http://10.4.26.198:8888/api/latest-tg-messages-long?limit=${limit}`;
    //const url = `http://172.20.10.3:8888/api/latest-tg-messages-long?limit=${limit}`;
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
      const now = Date.now();
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

                // 🚫 新增：任何消息超过 120 分钟跳过
      if (now - m._ts > 7_200_000) {
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


}
function extractSymbol(text: string): string | null {
  const m = text.match(/([A-Z0-9]{1,}USDT)\b/);
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
    const url = `http://${ip}:8889/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求DEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }
  static async getLatestDexMessages(limit: number = 25): Promise<DexMessagesResp> {
    try {
      const [raw, banList]: [DexMessage[], string[]] = await Promise.all([
        this.fetchDexMessages(limit),
        fetch("http://192.168.1.9:9001/dex/ban/list")
          .then(res => res.json())
          .catch(() => []),
      ]);
  
      type Aug = DexMessage & {
        _ts: number;
        _symbol: string;
      };
  
      // ban 转大写，方便对比
      const banned = new Set(banList.map(s => s.toUpperCase()));
  
      // 预处理：抽取 symbol + 时间戳
      const msgs: Aug[] = raw
        .map(m => {
          let symbol: string | null = null;
  
          if (m.text.startsWith("⚠️信号失效")) {
            const match = m.text.match(/[:：]\s*([A-Z0-9]+)/i);
            if (match) symbol = match[1].toUpperCase();
          } else {
            const match = m.text.match(/^[⚠️🟢]*\s*\$?([A-Za-z0-9]+)/);
            if (match) symbol = match[1].toUpperCase();
          }
  
          if (!symbol) return null;
          if (banned.has(symbol)) return null; // 🚫 ban 标的直接过滤掉
  
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
  
        if (m.text.startsWith("⚠️信号失效")) {
          // 失效：清理 kept 中该 symbol 的历史消息
          for (let i = kept.length - 1; i >= 0; i--) {
            if (kept[i]._symbol === symbol) kept.splice(i, 1);
          }
          state[symbol] = { lastInvalid: m._ts };
          continue;
        }
  
        const st = state[symbol] ?? { lastInvalid: -Infinity };
        if (m._ts <= st.lastInvalid) continue;
  
        // 保证同一个 symbol 只保留最新的
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
      console.error("获取DEX消息失败:", error);
      throw error;
    }
  }
  
}
