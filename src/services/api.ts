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
  private static async fetchCexMessages(limit: number = 4): Promise<CexMessage[]> {
    const url = `http://127.0.0.1:8888/api/latest-tg-messages?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`请求CEX消息失败: ${res.statusText}`);
    }
    return await res.json();
  }

  static async getLatestCexMessages(limit: number = 5): Promise<CexMessagesResp> {
    try {
      const messages = await this.fetchCexMessages(limit);
      
      // 按时间倒序排列
      const sortedMessages = messages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return {
        updatedAt: new Date().toISOString(),
        messages: sortedMessages
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
    // 先按多空行分块
    const blocks = text
      .split(/\n\s*\n+/)
      .map(b => b.trim())
      .filter(Boolean);

    if (blocks.length > 1) return blocks;

    // 退化为按分隔线或常见标记拆分
    const bySeparators = text
      .split(/\n?[-=]{3,}\n?|^-- .* --$|^=== .* ===$/gmi)
      .map(s => s.trim())
      .filter(Boolean);
    if (bySeparators.length > 1) return bySeparators;

    // 最后按单行切分并合并非空行，按每3~8行组合一条，避免过碎
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return [text.trim()];
    const chunkSize = Math.min(8, Math.max(3, Math.floor(lines.length / 5) || 3));
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
    return chunks;
  }

  static async getCexWaitingMessages(limit: number = 1): Promise<CexMessagesResp> {
    const raw = await this.fetchCexWaitingRaw(limit);
    const first = raw?.[0];
    if (!first) {
      return { updatedAt: new Date().toISOString(), messages: [] };
    }
    const parts = this.splitMixedMessages(first.text);
    const messages: CexMessage[] = parts.map((p) => ({
      text: p,
      // 使用后端时间；为避免key冲突，前端可拼接idx
      timestamp: first.timestamp
    }));
    return {
      updatedAt: new Date().toISOString(),
      messages
    };
  }
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
    const blocks = text
      .split(/\n\s*\n+/)
      .map(b => b.trim())
      .filter(Boolean);
    if (blocks.length > 1) return blocks;
    const bySeparators = text
      .split(/\n?[-=]{3,}\n?|^-- .* --$|^=== .* ===$/gmi)
      .map(s => s.trim())
      .filter(Boolean);
    if (bySeparators.length > 1) return bySeparators;
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return [text.trim()];
    const chunkSize = Math.min(8, Math.max(3, Math.floor(lines.length / 5) || 3));
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
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
