// 获取趋势状态对应的颜色
export const getTrendColor = (state: string): string => {
  switch (state) {
    case 'golden':
    case 'goldengt':
    case 'bull':
      return '#ffc107'; //  金叉/多
    case 'dead':
    case 'deadlt':
    case 'bear':
      return '#9c27b0'; // 死叉/空
    case 'flat':
    default:
      return '#9e9e9e'; // 随机漫步
  }
};

// 获取趋势状态的中文描述
export const getTrendLabel = (state: string): string => {
  switch (state) {
    case 'golden':
      return '金叉';
    case 'goldengt':
      return '金叉之上';
    case 'dead':
      return '死叉';
    case 'deadlt':
      return '死叉之下';
    case 'bull':
      return '做多';
    case 'bear':
      return '做空';
    case 'flat':
      return '随机漫步';
    default:
      return '—';
  }
};

// 获取交易方向对应的颜色
export const getTradeSideColor = (side: 'buy' | 'sell'): string => {
  return side === 'buy' ? '#19c37d' : '#ff5a5f';
};
