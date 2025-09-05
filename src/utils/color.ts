// 获取趋势状态对应的颜色
export const getTrendColor = (state: string): string => {
  switch (state) {
    case 'buymacd':
      return '#ffc107'; //  金叉/多
    case 'xbuymid':
      return '#ffc107'; 
    case 'sellmacd':
      return '#9c27b0'; // 死叉/空
    case 'xsellmid':
      return '#9c27b0'; // 死叉/空
    default:
      return '#9e9e9e'; // 随机漫步
  }
};

// 获取趋势状态的中文描述
export const getTrendLabel = (state: string): string => {
  switch (state) {
    case 'buymacd':
      return '做多';
    case 'xbuymid':
      return '做多';
    case 'up':
        return '做多';

    case 'sellmacd':
      return '做空';
    case 'xsellmid':
      return '做空';
    case 'down':
        return '做空';
    case 'range':
      return '跟随';
    default:
      return '—';
  }
};

// 获取交易方向对应的颜色
export const getTradeSideColor = (side: 'buy' | 'sell'): string => {
  return side === 'buy' ? '#19c37d' : '#ff5a5f';
};
