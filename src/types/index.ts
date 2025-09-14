
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



// CEX消息类型
export interface CexMessageL {
  text: string;
  timestamp: string;
}

// CEX消息响应类型
export interface CexMessagesRespL {
  updatedAt: string;
  messages: CexMessageL[];
}

// CEX消息类型
export interface CexMessageLB {
  text: string;
  timestamp: string;
}

// CEX消息响应类型
export interface CexMessagesRespLB {
  updatedAt: string;
  messages: CexMessageLB[];
}




// DEX消息类型
export interface DexMessage {
  text: string;
  timestamp: string;
}

// DEX消息响应类型
export interface DexMessagesResp {
  updatedAt: string;
  messages: DexMessage[];
}
