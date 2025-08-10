import { defineStore } from 'pinia';
import type { PriceResp, TrendResp, TrendAnalysisAggregatedResp, TrendApiState, LongTermTrendAnalysisAggregatedResp } from '@/types';
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

// 新增：长线趋势状态映射函数
const mapLongTermTrendState = (apiState: TrendApiState): string => {
  switch (apiState) {
    case 'UPEMA': return 'golden';    // 金叉
    case 'DOWNEMA': return 'dead';    // 死叉
    case 'UP': return 'bull';         // 多头
    case 'DOWN': return 'bear';       // 空头
    case 'RANGE': return 'flat';      // 乱
    default: return 'flat';
  }
};

export const useMarketStore = defineStore('market', {
  state: () => ({
    price: null as PriceResp | null,
    trendA: null as TrendResp | null,
    longTermTrend: null as TrendResp | null,
    loading: {
      price: false,
      trendA: false,
      longTermTrend: false
    },
    error: {
      price: null as string | null,
      trendA: null as string | null,
      longTermTrend: null as string | null
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

    // 获取长线趋势分析数据
    async fetchLongTermTrend() {
      this.loading.longTermTrend = true;
      this.error.longTermTrend = null;
      
      try {
        // 使用真实的长线趋势分析API
        const trendData = await TrendApiService.getAllLongTermTrends();
        
        // 将API数据转换为组件需要的格式
        const trendResp: TrendResp = {
          updatedAt: trendData.updatedAt,
          symbols: Object.entries(trendData.trends).map(([symbol, intervals]) => ({
            base: symbol,
            frames: {
              '4h': mapLongTermTrendState(intervals['4h'] as TrendApiState),
              '1d': mapLongTermTrendState(intervals['1d'] as TrendApiState),
              '3d': mapLongTermTrendState(intervals['3d'] as TrendApiState)
            }
          }))
        };
        
        this.longTermTrend = trendResp;
      } catch (error) {
        this.error.longTermTrend = '获取长线趋势分析数据失败';
        console.error('Failed to fetch long term trend:', error);
        
        // 如果API调用失败，使用模拟数据作为备用
        const fallbackData: TrendResp = {
          updatedAt: new Date().toISOString(),
          symbols: [
            {
              base: 'BTC',
              frames: {
                '4h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '3d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)]
              }
            },
            {
              base: 'ETH',
              frames: {
                '4h': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '1d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)],
                '3d': ['golden', 'dead', 'bull', 'bear', 'flat'][Math.floor(Math.random() * 5)]
              }
            }
          ]
        };
        this.longTermTrend = fallbackData;
      } finally {
        this.loading.longTermTrend = false;
      }
    }
  }
});
