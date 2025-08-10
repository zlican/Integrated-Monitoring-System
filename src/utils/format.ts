// 格式化价格显示
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return '--';
  return `$ ${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// 格式化数量显示
export const formatQuantity = (qty: number, decimals: number = 4): string => {
  return qty.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// 格式化时间戳
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour12: false });
};

// 格式化地址显示（截断）
export const formatAddress = (address: string, prefix: number = 6, suffix: number = 6): string => {
  if (address.length <= prefix + suffix + 3) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
};

// 格式化数字（带千分位）
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
