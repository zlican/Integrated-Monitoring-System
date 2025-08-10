import { defineStore } from 'pinia';
import type { PriceResp, TrendResp, TrendAnalysisAggregatedResp, TrendApiState } from '@/types';
import { PriceApiService, TrendApiService } from '@/services/api';

// 趋势状态映射函数
const mapTrendState = (apiState: TrendApiState, interval: string): string => {
  if (interval === '1h') {
    switch (apiState) {
      case 'UP': return 'bull';
      case 'DOWN': return 'bear';
      case 'RANGE': return 'flat';
      default: return 'flat';
    }
  } else {
    // 5m 和 15m 使用EMA指标
    switch (apiState) {
      case 'UPEMA': return 'golden';
      case 'DOWNEMA': return 'dead';
      default: return 'flat';
    }
  }
};

export const useMarketStore = defineStore('market', {
  state: () => ({
    price: null as PriceResp | null,
    trendA: null as TrendResp | null,
    trendB: null as TrendResp | null,
    loading: {
      price: false,
      trendA: false,
      trendB: false
    },
    error: {
      price: null as string | null,
      trendA: null as string | null,
      trendB: null as string | null
    }
  }),

  actions: {
    async fetchPrice() {
      this.loading.price = true;
      this.error.price = null;
      
      try {
        // 使用新的API服务获取价格
        const prices = await PriceApiService.getAllPrices();
        
        const priceData: PriceResp = {
          updatedAt: new Date().toISOString(),
          BTC: prices.BTC,
          ETH: prices.ETH
        };
        
        this.price = priceData;
      } catch (error) {
        this.error.price = '获取价格数据失败';
        console.error('Failed to fetch price:', error);
        
        // 如果API调用失败，使用模拟数据作为备用
        const fallbackData: PriceResp = {
          updatedAt: new Date().toISOString(),
          BTC: 45000 + Math.random() * 2000,
          ETH: 2800 + Math.random() * 200
        };
        this.price = fallbackData;
      } finally {
        this.loading.price = false;
      }
    },

    async fetchTrendA() {
      this.loading.trendA = true;
      this.error.trendA = null;
      
      try {
        // 使用真实的趋势分析API
        const trendData = await TrendApiService.getAllTrends();
        
        // 将API数据转换为组件需要的格式
        const trendResp: TrendResp = {
          updatedAt: trendData.updatedAt,
          symbols: Object.entries(trendData.trends).map(([symbol, intervals]) => ({
            base: symbol,
            frames: {
              '5m': mapTrendState(intervals['5m'] as TrendApiState, '5m'),
              '15m': mapTrendState(intervals['15m'] as TrendApiState, '15m'),
              '1h': mapTrendState(intervals['1h'] as TrendApiState, '1h')
            }
          }))
        };
        
        this.trendA = trendResp;
      } catch (error) {
        this.error.trendA = '获取趋势分析数据失败';
        console.error('Failed to fetch trend A:', error);
        
        // 如果API调用失败，使用模拟数据作为备用
        const fallbackData: TrendResp = {
          updatedAt: new Date().toISOString(),
          symbols: [
            {
              base: 'BTC',
              frames: {
                '5m': ['golden', 'dead', 'flat'][Math.floor(Math.random() * 3)],
                '15m': ['golden', 'dead', 'flat'][Math.floor(Math.random() * 3)],
                '1h': ['bull', 'bear', 'flat'][Math.floor(Math.random() * 3)]
              }
            },
            {
              base: 'ETH',
              frames: {
                '5m': ['golden', 'dead', 'flat'][Math.floor(Math.random() * 3)],
                '15m': ['golden', 'dead', 'flat'][Math.floor(Math.random() * 3)],
                '1h': ['bull', 'bear', 'flat'][Math.floor(Math.random() * 3)]
              }
            }
          ]
        };
        this.trendA = fallbackData;
      } finally {
        this.loading.trendA = false;
      }
    },

    async fetchTrendB() {
      this.loading.trendB = true;
      this.error.trendB = null;
      
      try {
        // 模拟API调用 - 趋势B数据（更多交易对）
        const mockData: TrendResp = {
          updatedAt: new Date().toISOString(),
          symbols: [
            {
              base: 'BTC',
              frames: {
                '5m': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '15m': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '4h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)]
              }
            },
            {
              base: 'ETH',
              frames: {
                '5m': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '15m': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '4h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)]
              }
            }
          ]
        };
        
        await new Promise(resolve => setTimeout(resolve, 300));
        this.trendB = mockData;
      } catch (error) {
        this.error.trendB = '获取趋势B数据失败';
        console.error('Failed to fetch trend B:', error);
      } finally {
        this.loading.trendB = false;
      }
    }
  }
});
