// 获取趋势状态对应的颜色
export const getTrendColor = (state: string): string => {
  switch (state) {
    case 'golden':
    case 'bull':
      return '#19c37d'; // 绿色 - 金叉/多
    case 'dead':
    case 'bear':
      return '#ff5a5f'; // 红色 - 死叉/空
    case 'flat':
    default:
      return '#00c2ff'; // 青色 - 盘整
  }
};

// 获取趋势状态的中文描述
export const getTrendLabel = (state: string): string => {
  switch (state) {
    case 'golden':
      return '金叉';
    case 'dead':
      return '死叉';
    case 'bull':
      return '多';
    case 'bear':
      return '空';
    case 'flat':
      return '盘整';
    default:
      return '—';
  }
};

// 获取交易方向对应的颜色
export const getTradeSideColor = (side: 'buy' | 'sell'): string => {
  return side === 'buy' ? '#19c37d' : '#ff5a5f';
};
