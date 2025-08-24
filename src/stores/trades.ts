import { defineStore } from 'pinia';
import type { Trade, DexInfoResp, CexMessagesResp, CexMessage, DexMessagesResp, DexMessage } from '@/types';
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
      cexWaiting: false,
      dexMessages: false,
      dexWaiting: false
    },
    error: {
      cex: null as string | null,
      dex: null as string | null,
      dexInfo: null as string | null,
      cexMessages: null as string | null,
      cexWaiting: null as string | null,
      dexMessages: null as string | null,
      dexWaiting: null as string | null
    },
    
    // CEX消息相关状态
    cexMessages: null as CexMessagesResp | null,
    // CEX等待区消息
    cexWaitingMessages: null as CexMessagesResp | null,
    
    // DEX消息相关状态
    dexMessages: null as DexMessagesResp | null,
    // DEX等待区消息
    dexWaitingMessages: null as DexMessagesResp | null,
  }),

  getters: {
    latestCex3: (state) => [...state.cex].sort((a, b) => b.ts - a.ts).slice(0, 3),
    latestDex3: (state) => [...state.dex].sort((a, b) => b.ts - a.ts).slice(0, 3),
    
    // 获取最近半小时的去重DEX消息
    recentDexMessagesDeduplicated: (state) => {
      if (!state.dexMessages?.messages) return [];
      
      const halfHourAgo = Date.now() - 30 * 60 * 1000; // 30分钟前
      
      // 过滤最近半小时的消息
      const recentMessages = state.dexMessages.messages.filter(msg => 
        new Date(msg.timestamp).getTime() > halfHourAgo
      );
      
      // 按时间倒序排序
      const sortedMessages = recentMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // 基于消息文本中的地址进行去重，保留最新的
      const addressMap = new Map<string, DexMessage>();
      
      for (const message of sortedMessages) {
        // 提取被两个反引号包裹的地址
        const addressMatch = message.text.match(/`([^`]+)`/);
        if (addressMatch) {
          const address = addressMatch[1];  // 注意是第1个捕获组
          if (!addressMap.has(address) || 
              new Date(message.timestamp).getTime() > new Date(addressMap.get(address)!.timestamp).getTime()) {
            addressMap.set(address, message);
          }
        } else {
          // 如果没有找到地址，使用消息文本的前50个字符作为唯一标识
          const textKey = message.text.substring(0, 50);
          if (!addressMap.has(textKey) || 
              new Date(message.timestamp).getTime() > new Date(addressMap.get(textKey)!.timestamp).getTime()) {
            addressMap.set(textKey, message);
          }
        }
      }
      
      // 返回去重后的消息，按时间倒序
      return Array.from(addressMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
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
    async fetchCexMessages(limit: number = 10) {
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
          ]
        };
        this.cexMessages = fallbackData;
      } finally {
        this.loading.cexMessages = false;
      }
    },

    // 获取CEX等待区消息
    async fetchCexWaitingMessages(limit: number = 1) {
      this.loading.cexWaiting = true;
      this.error.cexWaiting = null;
      try {
        const data = await CexApiService.getCexWaitingMessages(limit);
        // 将同一timestamp的多条内容，用timestamp+序号供前端key稳定
        const ts = data.messages?.[0]?.timestamp;
        if (ts) {
          data.messages = data.messages.map((m: CexMessage, i: number) => ({ ...m, timestamp: `${ts}-${i}` }));
        }
        this.cexWaitingMessages = data;
      } catch (error) {
        this.error.cexWaiting = '获取CEX等待区消息失败';
        console.error('Failed to fetch CEX waiting messages:', error);
        this.cexWaitingMessages = {
          updatedAt: new Date().toISOString(),
          messages: []
        };
      } finally {
        this.loading.cexWaiting = false;
      }
    },

    // 获取DEX消息
    async fetchDexMessages(limit: number = 25) {
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
          messages: []
        };
        this.dexMessages = fallbackData;
      } finally {
        this.loading.dexMessages = false;
      }
    },

    // 获取DEX等待区消息
    async fetchDexWaitingMessages(limit: number = 1) {
      this.loading.dexWaiting = true;
      this.error.dexWaiting = null;
      try {
        const data = await DexApiService.getDexWaitingMessages(limit);
        const ts = data.messages?.[0]?.timestamp;
        if (ts) {
          data.messages = data.messages.map((m: DexMessage, i: number) => ({ ...m, timestamp: `${ts}-${i}` }));
        }
        this.dexWaitingMessages = data;
      } catch (error) {
        this.error.dexWaiting = '获取DEX等待区消息失败';
        console.error('Failed to fetch DEX waiting messages:', error);
        this.dexWaitingMessages = {
          updatedAt: new Date().toISOString(),
          messages: []
        };
      } finally {
        this.loading.dexWaiting = false;
      }
    }
  }
});
