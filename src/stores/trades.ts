import { defineStore } from 'pinia';
import type { Trade, DexInfoResp, DexInfoItem, CexMessagesResp, CexMessage, DexMessagesResp, DexMessage } from '@/types';
import { CexApiService, DexApiService } from '@/services/api';

export const useTradesStore = defineStore('trades', {
  state: () => ({
    cex: [] as Trade[],
    dex: [] as Trade[],
    dexInfo: null as DexInfoResp | null,
    loading: {
      cex: false,
      dex: false,
      dexInfo: false,
      cexMessages: false,
      dexMessages: false
    },
    error: {
      cex: null as string | null,
      dex: null as string | null,
      dexInfo: null as string | null,
      cexMessages: null as string | null,
      dexMessages: null as string | null
    },
    
    // CEX消息相关状态
    cexMessages: null as CexMessagesResp | null,
    
    // DEX消息相关状态
    dexMessages: null as DexMessagesResp | null,
  }),

  getters: {
    latestCex3: (state) => [...state.cex].sort((a, b) => b.ts - a.ts).slice(0, 3),
    latestDex3: (state) => [...state.dex].sort((a, b) => b.ts - a.ts).slice(0, 3),
  },

  actions: {
    upsertTrades(source: 'cex' | 'dex', incoming: Trade | Trade[]) {
      const list = Array.isArray(incoming) ? incoming : [incoming];
      const target = source === 'cex' ? this.cex : this.dex;
      const map = new Map(target.map(t => [t.id, t]));
      
      for (const t of list) {
        map.set(t.id, t);
      }
      
      const merged = Array.from(map.values())
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 50); // 增加到50条记录
      
      if (source === 'cex') {
        this.cex = merged;
      } else {
        this.dex = merged;
      }
    },

    async initSnapshots() {
      try {
        // 模拟初始化数据 - CEX交易
        const mockCexTrades: Trade[] = Array.from({ length: 20 }, (_, i) => ({
          id: `cex-${Date.now()}-${i}`,
          source: 'cex' as const,
          ts: Date.now() - i * 60000,
          symbol: ['BTC/USDT', 'ETH/USDT'][Math.floor(Math.random() * 10)],
          side: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 45000 + Math.random() * 2000,
          qty: 0.1 + Math.random() * 2
        }));

        // 模拟初始化数据 - DEX交易
        const mockDexTrades: Trade[] = Array.from({ length: 20 }, (_, i) => ({
          id: `dex-${Date.now()}-${i}`,
          source: 'dex' as const,
          ts: Date.now() - i * 60000,
          symbol: ['WETH/USDC', 'WBTC/USDC'][Math.floor(Math.random() * 10)],
          side: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 2800 + Math.random() * 200,
          qty: 0.1 + Math.random() * 2,
          addr: `0x${Math.random().toString(16).slice(2, 42)}`,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`
        }));

        this.upsertTrades('cex', mockCexTrades);
        this.upsertTrades('dex', mockDexTrades);
      } catch (error) {
        console.error('Failed to initialize snapshots:', error);
      }
    },

    async fetchDexInfo() {
      this.loading.dexInfo = true;
      this.error.dexInfo = null;
      
      try {
        // 模拟API调用 - 更丰富的DEX信息
        const mockData: DexInfoResp = {
          updatedAt: new Date().toISOString(),
          items: [
            {
              token: 'WETH',
              chain: 'Ethereum',
              pair: 'WETH/USDC',
              txCount: Math.floor(Math.random() * 1000) + 100,
              volumeUsd: Math.random() * 1000000 + 100000,
              priceChange1h: (Math.random() - 0.5) * 10
            },
            {
              token: 'WBTC',
              chain: 'Ethereum',
              pair: 'WBTC/USDC',
              txCount: Math.floor(Math.random() * 500) + 50,
              volumeUsd: Math.random() * 500000 + 50000,
              priceChange1h: (Math.random() - 0.5) * 8
            }
          ]
        };
        
        await new Promise(resolve => setTimeout(resolve, 300));
        this.dexInfo = mockData;
      } catch (error) {
        this.error.dexInfo = '获取DEX信息失败';
        console.error('Failed to fetch DEX info:', error);
      } finally {
        this.loading.dexInfo = false;
      }
    },

    // 模拟实时交易数据
    addMockTrade(source: 'cex' | 'dex') {
      const mockTrade: Trade = {
        id: `${source}-${Date.now()}`,
        source,
        ts: Date.now(),
        symbol: source === 'cex' 
          ? ['BTC/USDT', 'ETH/USDT'][Math.floor(Math.random() * 10)]
          : ['WETH/USDC', 'WBTC/USDC'][Math.floor(Math.random() * 10)],
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        price: source === 'cex' ? 45000 + Math.random() * 2000 : 2800 + Math.random() * 200,
        qty: 0.1 + Math.random() * 2,
        ...(source === 'dex' && {
          addr: `0x${Math.random().toString(16).slice(2, 42)}`,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`
        })
      };
      
      this.upsertTrades(source, mockTrade);
    },

    // 批量添加模拟交易数据
    addBatchMockTrades(source: 'cex' | 'dex', count: number = 5) {
      const mockTrades: Trade[] = Array.from({ length: count }, (_, i) => ({
        id: `${source}-${Date.now()}-${i}`,
        source,
        ts: Date.now() - i * 1000, // 每秒一个交易
        symbol: source === 'cex' 
          ? ['BTC/USDT', 'ETH/USDT'][Math.floor(Math.random() * 10)]
          : ['WETH/USDC', 'WBTC/USDC'][Math.floor(Math.random() * 10)],
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        price: source === 'cex' ? 45000 + Math.random() * 2000 : 2800 + Math.random() * 200,
        qty: 0.1 + Math.random() * 2,
        ...(source === 'dex' && {
          addr: `0x${Math.random().toString(16).slice(2, 42)}`,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`
        })
      }));
      
      this.upsertTrades(source, mockTrades);
    },

    // 获取CEX消息
    async fetchCexMessages(limit: number = 3) {
      this.loading.cexMessages = true;
      this.error.cexMessages = null;
      
      try {
        const messagesData = await CexApiService.getLatestCexMessages(limit);
        this.cexMessages = messagesData;
      } catch (error) {
        this.error.cexMessages = '获取CEX消息失败';
        console.error('Failed to fetch CEX messages:', error);
        
        // 如果API调用失败，使用模拟数据作为备用
        const fallbackData: CexMessagesResp = {
          updatedAt: new Date().toISOString(),
          messages: [
            {
              text: "🎁趋势：BTC🟢 | ETH🟢\n🟢 BTCUSDT   \n",
              timestamp: new Date().toISOString()
            },
            {
              text: "📊市场更新：BTC突破关键阻力位",
              timestamp: new Date(Date.now() - 60000).toISOString()
            },
            {
              text: "🔥热门交易对：ETH/USDT成交量激增",
              timestamp: new Date(Date.now() - 120000).toISOString()
            }
          ]
        };
        this.cexMessages = fallbackData;
      } finally {
        this.loading.cexMessages = false;
      }
    },

    // 获取DEX消息
    async fetchDexMessages(limit: number = 3) {
      this.loading.dexMessages = true;
      this.error.dexMessages = null;
      
      try {
        const messagesData = await DexApiService.getLatestDexMessages(limit);
        this.dexMessages = messagesData;
      } catch (error) {
        this.error.dexMessages = '获取DEX消息失败';
        console.error('Failed to fetch DEX messages:', error);
        
        // 如果API调用失败，使用模拟数据作为备用
        const fallbackData: DexMessagesResp = {
          updatedAt: new Date().toISOString(),
          messages: [
            {
              text: "🟣LIZARD\n📬 `347k5f1WLRYe81roRcLBWDR6k3eCRunaqetQPW6pbonk`",
              timestamp: new Date().toISOString()
            },
            {
              text: "🔥热门代币：SOL突破关键阻力位",
              timestamp: new Date(Date.now() - 60000).toISOString()
            },
            {
              text: "📊DEX交易量激增：Uniswap V3创新高",
              timestamp: new Date(Date.now() - 120000).toISOString()
            }
          ]
        };
        this.dexMessages = fallbackData;
      } finally {
        this.loading.dexMessages = false;
      }
    }
  }
});
