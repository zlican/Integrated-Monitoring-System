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

// 格式化时间（稳健）：接受 string|number|Date|null/undefined
export const formatTime = (timestamp?: string | number | Date | null): string => {
  if (!timestamp) return '';

  // 如果已经是 "HH:mm:ss" 则直接返回（避免重复解析）
  if (typeof timestamp === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
    return timestamp;
  }

  // 将输入规范化为可被 Date 解析的字符串或 Date 对象
  let parseTarget: string | Date;
  if (typeof timestamp === 'number') {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    parseTarget = d;
  } else if (timestamp instanceof Date) {
    if (isNaN(timestamp.getTime())) return '';
    parseTarget = timestamp;
  } else {
    // 字符串：去掉多余的毫秒位（把任意多位小数截到 3 位）
    parseTarget = (timestamp as string).trim().replace(/(\.\d{3})\d+/, '$1');
  }

  const date = parseTarget instanceof Date ? parseTarget : new Date(parseTarget);
  if (isNaN(date.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 兼容旧名字（把 message 的 timestamp 格式化成 HH:mm:ss）
export function formatTimeMessage(timestamp: string | number | Date | null | undefined): string {
  return formatTime(timestamp);
}

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