// 趋势状态类型
export type TrendState = 'golden' | 'dead' | 'bull' | 'bear' | 'flat';

// 新增：趋势分析API返回的原始状态类型
export type TrendApiState = 'UP' | 'DOWN' | 'RANGE' | 'UPEMA' | 'DOWNEMA' | 'unknown';

// 新增：长线趋势状态类型（4H、1D、3D使用相同的状态映射）
export type LongTermTrendState = 'bull' | 'bear' | 'flat';

// 趋势分析响应类型
export interface TrendAnalysisResp {
  symbol: string;
  interval: string;
  trend: TrendApiState;
  timestamp: string;
}

// 趋势分析聚合响应类型
export interface TrendAnalysisAggregatedResp {
  updatedAt: string;
  trends: {
    [symbol: string]: {
      [interval: string]: TrendApiState;
    };
  };
}

// 新增：长线趋势分析聚合响应类型
export interface LongTermTrendAnalysisAggregatedResp {
  updatedAt: string;
  trends: {
    [symbol: string]: {
      [interval: string]: TrendApiState;
    };
  };
}

// 价格响应类型
export interface PriceResp {
  updatedAt: string;
  BTC: number;
  ETH: number;
}

// 扩展的价格响应类型
export interface ExtendedPriceResp {
  updatedAt: string;
  prices: {
    [symbol: string]: {
      price: number;
      change24h: number;
      volume24h: number;
      marketCap: number;
    }
  }
}

// 趋势框架类型
export interface TrendFrame {
  [key: string]: TrendState; // '5m', '15m', '1h', '4h', '1d', ...
}

// 趋势项目类型
export interface TrendItem {
  base: string; // 改为string类型，更灵活
  frames: TrendFrame;
}

// 趋势响应类型
export interface TrendResp {
  updatedAt: string;
  symbols: TrendItem[];
}

// 交易类型
export interface Trade {
  id: string;
  source: 'cex' | 'dex';
  ts: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  qty: number;
  addr?: string;
  txHash?: string;
}

// DEX信息项目类型
export interface DexInfoItem {
  token: string;
  chain: string;
  pair: string;
  txCount: number;
  volumeUsd: number;
  priceChange1h: number;
}

// DEX信息响应类型
export interface DexInfoResp {
  updatedAt: string;
  items: DexInfoItem[];
}

// 市场概览类型
export interface MarketOverview {
  updatedAt: string;
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex: number;
  activeCoins: number;
}

// 价格提醒类型
export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

// 交易对信息类型
export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

// CEX消息类型
export interface CexMessage {
  text: string;
  timestamp: string;
}

// CEX消息响应类型
export interface CexMessagesResp {
  updatedAt: string;
  messages: CexMessage[];
}
