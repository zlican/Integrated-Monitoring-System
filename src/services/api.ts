import { API_CONFIG, getCurrentConfig } from '@/config/api';
import type { TrendAnalysisAggregatedResp, LongTermTrendAnalysisAggregatedResp, CexMessage, CexMessagesResp, DexMessage, DexMessagesResp, TrendApiState } from '@/types';

// 价格API服务
export class PriceApiService {
  private static async fetchPriceText(symbol: string): Promise<string> {
    const url = `http://127.0.0.1:8081/api/price/${symbol}?format=text`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求 ${symbol} 价格失败: ${res.statusText}`);
    }
    return await res.text();
  }
  

  private static parsePriceFromText(text: string, symbol: string): number {
    // 从 "BTC Price: 118201.30" 里提取数字
    const match = text.match(/([\d.]+)/);
    if (!match) {
      throw new Error(`无法解析 ${symbol} 价格: ${text}`);
    }
    return parseFloat(match[1]);
  }

  static async getBTCPrice(): Promise<number> {
    const text = await this.fetchPriceText('btc');
    return this.parsePriceFromText(text, 'BTC');
  }

  static async getETHPrice(): Promise<number> {
    const text = await this.fetchPriceText('eth');
    return this.parsePriceFromText(text, 'ETH');
  }

  static async getAllPrices(): Promise<{ BTC: number; ETH: number }> {
    try {
      const [btcPrice, ethPrice] = await Promise.all([
        this.getBTCPrice(),
        this.getETHPrice()
      ]);
      return { BTC: btcPrice, ETH: ethPrice };
    } catch (error) {
      console.error('获取所有价格失败:', error);
      throw error;
    }
  }
}

// 趋势分析API服务
export class TrendApiService {
  private static async fetchTrendText(symbol: string, interval: string): Promise<string> {
    const url = `http://127.0.0.1:8080/api/trend/${symbol}?interval=${interval}&format=text`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求 ${symbol} ${interval} 趋势失败: ${res.statusText}`);
    }
    return await res.text();
  }

  private static parseTrendFromText(text: string, symbol: string, interval: string): string {
    // 从 "BTC Trend: UP" 或 "ETH Trend: UPEMA" 里提取趋势状态
    const match = text.match(new RegExp(`${symbol} Trend:\\s*(\\w+)`));
    if (!match) {
      throw new Error(`无法解析 ${symbol} ${interval} 趋势: ${text}`);
    }
    return match[1];
  }

  static async getBTCTrend(interval: string): Promise<string> {
    const text = await this.fetchTrendText('btc', interval);
    return this.parseTrendFromText(text, 'BTC', interval);
  }

  static async getETHTrend(interval: string): Promise<string> {
    const text = await this.fetchTrendText('eth', interval);
    return this.parseTrendFromText(text, 'ETH', interval);
  }

  static async getAllTrends(): Promise<TrendAnalysisAggregatedResp> {
    try {
      const intervals = ['1h', '15m', '5m'];
      const symbols = ['btc', 'eth'];
      
      const trends: { [symbol: string]: { [interval: string]: TrendApiState } } = {} as any;
      
      for (const symbol of symbols) {
        trends[symbol.toUpperCase()] = {};
        for (const interval of intervals) {
          try {
            const trend = symbol === 'btc' 
              ? await this.getBTCTrend(interval)
              : await this.getETHTrend(interval);
            trends[symbol.toUpperCase()][interval] = trend as TrendApiState;
          } catch (error) {
            console.error(`获取 ${symbol.toUpperCase()} ${interval} 趋势失败:`, error);
            trends[symbol.toUpperCase()][interval] = 'unknown';
          }
        }
      }
      
      return {
        updatedAt: new Date().toISOString(),
        trends
      };
    } catch (error) {
      console.error('获取所有趋势数据失败:', error);
      throw error;
    }
  }

  // 新增：获取长线趋势分析数据
  static async getAllLongTermTrends(): Promise<LongTermTrendAnalysisAggregatedResp> {
    try {
      const intervals = ['4h', '1d', '3d'];
      const symbols = ['btc', 'eth'];
      
      const trends: { [symbol: string]: { [interval: string]: TrendApiState } } = {} as any;
      
      for (const symbol of symbols) {
        trends[symbol.toUpperCase()] = {};
        for (const interval of intervals) {
          try {
            const trend = symbol === 'btc' 
              ? await this.getBTCTrend(interval)
              : await this.getETHTrend(interval);
            trends[symbol.toUpperCase()][interval] = trend as TrendApiState;
          } catch (error) {
            console.error(`获取 ${symbol.toUpperCase()} ${interval} 长线趋势失败:`, error);
            trends[symbol.toUpperCase()][interval] = 'unknown';
          }
        }
      }
      
      return {
        updatedAt: new Date().toISOString(),
        trends
      };
    } catch (error) {
      console.error('获取所有长线趋势数据失败:', error);
      throw error;
    }
  }
}

// CEX消息API服务
export class CexApiService {
  private static async fetchCexMessages(limit: number = 10): Promise<CexMessage[]> {
    const url = `http://127.0.0.1:8888/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }

  static async getLatestCexMessages(limit: number = 10): Promise<CexMessagesResp> {
    try {
      const raw = await this.fetchCexMessages(limit);

      // 规范化：解析时间戳与提取symbol（仅处理包含symbol的行）
      type Aug = CexMessage & { _ts: number; _symbol: string };
      const msgs: Aug[] = raw
        .map(m => {
          const symbol = extractSymbol(m.text);
          if (!symbol) return null;
          return { ...m, _ts: new Date(m.timestamp).getTime(), _symbol: symbol };
        })
        .filter((x): x is Aug => !!x);

      // 第一趟：记录每个symbol的“最后一次失效时间”
      const lastInvalid: Record<string, number> = {};
      for (const m of msgs) {
        if (isInvalidation(m.text)) {
          const prev = lastInvalid[m._symbol] ?? -Infinity;
          if (m._ts > prev) lastInvalid[m._symbol] = m._ts;
        }
      }

      // 第二趟：过滤
      const kept = msgs.filter(m => {
        if (isInvalidation(m.text)) return false; // 不展示“失效”行
        const inv = lastInvalid[m._symbol];
        // 仅当消息时间严格晚于最后一次失效，或者根本没失效记录时，才保留
        return inv === undefined || m._ts > inv;
      });

      // 按时间倒序返回
      kept.sort((a, b) => b._ts - a._ts);

      // 移除内部字段
      const finalMessages: CexMessage[] = kept.map(({ _ts, _symbol, ...rest }) => rest);

      return {
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      };
    } catch (error) {
      console.error('获取CEX消息失败:', error);
      throw error;
    }
  }

  // 新增：CEX等待区消息（后端仅返回1条混合文本，需要前端拆分）
  private static async fetchCexWaitingRaw(limit: number = 1): Promise<CexMessage[]> {
    const url = `http://127.0.0.1:8888/api/latest-tg-messages-waiting?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX等待区消息失败: ${res.statusText}`);
    }
    return await res.json();
  }

  private static splitMixedMessages(text: string): string[] {
    if (!text) return [];
    // 直接按行拆分，去空行和空白
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  static async getCexWaitingMessages(limit: number = 1): Promise<CexMessagesResp> {
    const raw = await this.fetchCexWaitingRaw(limit);
    const first = raw?.[0];
    if (!first) {
      return { updatedAt: new Date().toISOString(), messages: [] };
    }
    const parts = this.splitMixedMessages(first.text);
    const messages: CexMessage[] = parts.map((line, idx) => ({
      text: line,
      // 拼接idx避免key冲突
      timestamp: first.timestamp + `-${idx}`
    }));
    return {
      updatedAt: new Date().toISOString(),
      messages
    };
  }
  
}

function extractSymbol(text: string): string | null {
  // 捕获类似 ABCUSDT / BTCUSDT 的交易对（允许前后有emoji与空格）
  const m = text.match(/([A-Z0-9]{2,}USDT)\b/);
  return m ? m[1] : null;
}

function isInvalidation(text: string): boolean {
  // 关键字匹配：⚠️信号失效
  return text.includes('信号失效');
}
// DEX消息API服务
export class DexApiService {
  private static async fetchDexMessages(limit: number = 25): Promise<DexMessage[]> {
    const url = `http://127.0.0.1:8889/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求DEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }

  static async getLatestDexMessages(limit: number = 25): Promise<DexMessagesResp> {
    try {
      const messages = await this.fetchDexMessages(limit);
      
      // 按时间倒序排列
      const sortedMessages = messages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return {
        updatedAt: new Date().toISOString(),
        messages: sortedMessages
      };
    } catch (error) {
      console.error('获取DEX消息失败:', error);
      throw error;
    }
  }

  // 新增：DEX等待区消息（后端仅返回1条混合文本，需要前端拆分）
  private static async fetchDexWaitingRaw(limit: number = 1): Promise<DexMessage[]> {
    const url = `http://127.0.0.1:8889/api/latest-tg-messages-waiting?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求DEX等待区消息失败: ${res.statusText}`);
    }
    return await res.json();
  }

  private static splitMixedMessages(text: string): string[] {
    if (!text) return [];
  
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const chunks: string[] = [];
  
    // 每两行为一条消息
    for (let i = 0; i < lines.length; i += 2) {
      const firstLine = lines[i] || '';
      const secondLine = lines[i + 1] || '';
      const combined = [firstLine, secondLine].filter(Boolean).join('\n');
      if (combined) {
        chunks.push(combined);
      }
    }
  
    return chunks;
  }

  static async getDexWaitingMessages(limit: number = 1): Promise<DexMessagesResp> {
    const raw = await this.fetchDexWaitingRaw(limit);
    const first = raw?.[0];
    if (!first) {
      return { updatedAt: new Date().toISOString(), messages: [] };
    }
    const parts = this.splitMixedMessages(first.text);
    const messages: DexMessage[] = parts.map((p) => ({
      text: p,
      timestamp: first.timestamp
    }));
    return {
      updatedAt: new Date().toISOString(),
      messages
    };
  }
}

// 通用API工具函数
export const apiUtils = {
  // 检查API连接状态
  async checkConnection(): Promise<boolean> {
    try {
      const config = getCurrentConfig();
      const response = await fetch(`${config.API_BASE_URL}/price/btc?format=text`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(API_CONFIG.REQUEST.TIMEOUT)
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // 获取API状态信息
  async getApiStatus(): Promise<{
    connected: boolean;
    responseTime: number;
    lastCheck: string;
  }> {
    const startTime = Date.now();
    const connected = await this.checkConnection();
    const responseTime = Date.now() - startTime;
    
    return {
      connected,
      responseTime,
      lastCheck: new Date().toISOString()
    };
  },

  // 获取配置信息
  getConfig() {
    return {
      ...API_CONFIG,
      current: getCurrentConfig()
    };
  }
};
