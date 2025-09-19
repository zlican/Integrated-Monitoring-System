import { defineStore } from 'pinia';
import type { CexMessagesResp, DexMessagesResp, DexMessage, CexMessagesRespL } from '@/types';
import { CexApiService, DexApiService } from '@/services/api';

export const useTradesStore = defineStore('trades', {
  state: () => ({
    loading: {
      cexMessages: false,
      dexMessages: false,
      cexLong:false,
    },
    error: {
      cexMessages: null as string | null,
      dexMessages: null as string | null,
      cexLong: null as string | null,
    },
    
    // CEX消息相关状态
    cexMessages: null as CexMessagesResp | null,
    
    // CEX消息中线相关状态
    cexMessagesL: null as CexMessagesRespL | null,
    
    // DEX消息相关状态
    dexMessages: null as DexMessagesResp | null,
  }),

  getters: {
    // 获取最近 10 分钟的去重DEX消息
    recentDexMessagesDeduplicated: (state) => {
      if (!state.dexMessages?.messages) return [];
      
      const halfHourAgo = Date.now() - 10 * 60 * 1000; // 10分钟前
      
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
    // 获取CEX消息
    async fetchCexMessages(limit: number = 25) {
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
        // 获取CEX消息
        async fetchCexMessagesL(limit: number = 25) {
          this.loading.cexLong = true;
          this.error.cexLong = null;
          
          try {
            const messagesData = await CexApiService.getLatestCexMessagesL(limit);
            this.cexMessagesL = messagesData;
          } catch (error) {
            this.error.cexLong = '获取CEX长线消息失败';
            console.error('Failed to fetch CEX messages:', error);
            
            // 如果API调用失败，使用模拟数据作为备用
            const fallbackData: CexMessagesRespL = {
              updatedAt: new Date().toISOString(),
              messages: [
              ]
            };
            this.cexMessagesL = fallbackData;
          } finally {
            this.loading.cexLong = false;
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
  }
});
