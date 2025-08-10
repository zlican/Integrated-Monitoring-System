// 趋势状态类型
export type TrendState = 'golden' | 'dead' | 'bull' | 'bear' | 'flat';

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
