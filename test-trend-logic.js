// 趋势分析状态映射逻辑测试
// 这个文件用于验证短线趋势和长线趋势的状态映射是否正确

// 模拟短线趋势状态映射函数
const mapTrendState = (apiState, interval) => {
  if (interval === '1h') {
    switch (apiState) {
      case 'UP': return 'bull';
      case 'DOWN': return 'bear';
      case 'RANGE': return 'flat';
      default: return 'flat';
    }
  } else {
    // 5m 和 15m 使用EMA指标
    switch (apiState) {
      case 'UPEMA': return 'golden';
      case 'DOWNEMA': return 'dead';
      default: return 'flat';
    }
  }
};

// 模拟长线趋势状态映射函数
const mapLongTermTrendState = (apiState) => {
  switch (apiState) {
    case 'UPEMA': return 'golden';    // 金叉
    case 'DOWNEMA': return 'dead';    // 死叉
    case 'UP': return 'bull';         // 多头趋势
    case 'DOWN': return 'bear';       // 空头趋势
    case 'RANGE': return 'flat';      // 盘整
    default: return 'flat';
  }
};

// 测试用例
console.log('=== 趋势分析状态映射测试 ===\n');

console.log('短线趋势测试（5M、15M使用EMA指标）：');
console.log('5M UPEMA ->', mapTrendState('UPEMA', '5m'), '(应该是golden/金叉)');
console.log('5M DOWNEMA ->', mapTrendState('DOWNEMA', '5m'), '(应该是dead/死叉)');
console.log('15M UPEMA ->', mapTrendState('UPEMA', '15m'), '(应该是golden/金叉)');
console.log('15M DOWNEMA ->', mapTrendState('DOWNEMA', '15m'), '(应该是dead/死叉)');

console.log('\n短线趋势测试（1H使用趋势方向）：');
console.log('1H UP ->', mapTrendState('UP', '1h'), '(应该是bull/多头)');
console.log('1H DOWN ->', mapTrendState('DOWN', '1h'), '(应该是bear/空头)');
console.log('1H RANGE ->', mapTrendState('RANGE', '1h'), '(应该是flat/盘整)');

console.log('\n长线趋势测试（4H、1D、3D支持EMA和趋势方向）：');
console.log('4H UPEMA ->', mapLongTermTrendState('UPEMA'), '(应该是golden/金叉)');
console.log('4H DOWNEMA ->', mapLongTermTrendState('DOWNEMA'), '(应该是dead/死叉)');
console.log('1D UP ->', mapLongTermTrendState('UP'), '(应该是bull/多头)');
console.log('1D DOWN ->', mapLongTermTrendState('DOWN'), '(应该是bear/空头)');
console.log('3D RANGE ->', mapLongTermTrendState('RANGE'), '(应该是flat/盘整)');

console.log('\n=== 测试完成 ===');
console.log('\n说明：');
console.log('- 短线趋势：5M/15M使用EMA指标，1H使用趋势方向');
console.log('- 长线趋势：所有时间框架都支持EMA指标和趋势方向');
console.log('- EMA指标优先级高于趋势方向');
console.log('- UPEMA -> golden (金叉)');
console.log('- DOWNEMA -> dead (死叉)');
console.log('- UP -> bull (多头)');
console.log('- DOWN -> bear (空头)');
console.log('- RANGE -> flat (盘整)');
