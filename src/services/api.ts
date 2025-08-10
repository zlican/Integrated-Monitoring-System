import { API_CONFIG, getCurrentConfig } from '@/config/api';
import type { TrendAnalysisResp, TrendAnalysisAggregatedResp } from '@/types';

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
      
      const trends: { [symbol: string]: { [interval: string]: string } } = {};
      
      for (const symbol of symbols) {
        trends[symbol.toUpperCase()] = {};
        for (const interval of intervals) {
          try {
            const trend = symbol === 'btc' 
              ? await this.getBTCTrend(interval)
              : await this.getETHTrend(interval);
            trends[symbol.toUpperCase()][interval] = trend;
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
      
      const trends: { [symbol: string]: { [interval: string]: string } } = {};
      
      for (const symbol of symbols) {
        trends[symbol.toUpperCase()] = {};
        for (const interval of intervals) {
          try {
            const trend = symbol === 'btc' 
              ? await this.getBTCTrend(interval)
              : await this.getETHTrend(interval);
            trends[symbol.toUpperCase()][interval] = trend;
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
