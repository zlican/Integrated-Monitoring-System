import { API_CONFIG, getCurrentConfig } from '@/config/api';

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
