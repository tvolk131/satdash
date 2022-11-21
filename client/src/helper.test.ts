import {
  formatNumber,
  getBlockRewardFromBlockHeight,
  getDurationEstimateFromBlockCount,
  getMinedBitcoinAmountFromBlockHeight,
  getNextHalvingData,
  truncateNumber
} from './helper';
import {BitcoinAmount} from './bitcoin';

describe('getMinedBitcoinAmountFromBlockHeight', () => {
  it('returns correct value for intial block heights', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(0))
      .toEqual(new BitcoinAmount({coins: 0}));
    expect(getMinedBitcoinAmountFromBlockHeight(1))
      .toEqual(new BitcoinAmount({coins: 50}));
  });

  it('returns correct value between each halving', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(210000))
      .toEqual(new BitcoinAmount({coins: 10500000}));
    expect(getMinedBitcoinAmountFromBlockHeight(210001))
      .toEqual(new BitcoinAmount({coins: 10500025}));

    expect(getMinedBitcoinAmountFromBlockHeight(420000))
      .toEqual(new BitcoinAmount({coins: 15750000}));
    expect(getMinedBitcoinAmountFromBlockHeight(420001))
      .toEqual(new BitcoinAmount({coins: 15750012, sats: 50000000}));

    expect(getMinedBitcoinAmountFromBlockHeight(630000))
      .toEqual(new BitcoinAmount({coins: 18375000}));
    expect(getMinedBitcoinAmountFromBlockHeight(630001))
      .toEqual(new BitcoinAmount({coins: 18375006, sats: 25000000}));

    expect(getMinedBitcoinAmountFromBlockHeight(840000))
      .toEqual(new BitcoinAmount({coins: 19687500}));
    expect(getMinedBitcoinAmountFromBlockHeight(840001))
      .toEqual(new BitcoinAmount({coins: 19687503, sats: 12500000}));
  });

  it('converges on 20,999,999.9769 coins', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(100000000))
      .toEqual(new BitcoinAmount({coins: 20999999, sats: 97690000}));
  });
});

describe('getBlockRewardFromBlockHeight', () => {
  it('returns correct value', () => {
    expect(getBlockRewardFromBlockHeight(0))
      .toEqual(new BitcoinAmount({coins: 50}));
    expect(getBlockRewardFromBlockHeight(209999))
      .toEqual(new BitcoinAmount({coins: 50}));

    expect(getBlockRewardFromBlockHeight(210000))
      .toEqual(new BitcoinAmount({coins: 25}));
    expect(getBlockRewardFromBlockHeight(419999))
      .toEqual(new BitcoinAmount({coins: 25}));

    expect(getBlockRewardFromBlockHeight(420000))
      .toEqual(new BitcoinAmount({coins: 12, sats: 50000000}));
    expect(getBlockRewardFromBlockHeight(629999))
      .toEqual(new BitcoinAmount({coins: 12, sats: 50000000}));

    expect(getBlockRewardFromBlockHeight(630000))
      .toEqual(new BitcoinAmount({coins: 6, sats: 25000000}));
    expect(getBlockRewardFromBlockHeight(839999))
      .toEqual(new BitcoinAmount({coins: 6, sats: 25000000}));

    expect(getBlockRewardFromBlockHeight(840000))
      .toEqual(new BitcoinAmount({coins: 3, sats: 12500000}));
  });
});

describe('truncateNumber', () => {
  it('behaves correctly', () => {
    expect(truncateNumber(123.456, 0)).toEqual(123);
    expect(truncateNumber(123.456, 1)).toEqual(123.5);
    expect(truncateNumber(123.456, 2)).toEqual(123.46);
    expect(truncateNumber(123.456, 3)).toEqual(123.456);
    expect(truncateNumber(123.456, 4)).toEqual(123.456);
  });

  it('rounds up and down correctly', () => {
    expect(truncateNumber(123.45, 1)).toEqual(123.5);
    expect(truncateNumber(123.44, 1)).toEqual(123.4);
  });

  it('handles negative number for digit count', () => {
    expect(truncateNumber(124, -1)).toEqual(120);
    expect(truncateNumber(125, -1)).toEqual(130);

    expect(truncateNumber(149, -2)).toEqual(100);
    expect(truncateNumber(150, -2)).toEqual(200);
  });
});

describe('formatNumber', () => {
  it('returns proper number with commas', () => {
    expect(formatNumber(0, 'fullNumberWithCommas')).toEqual('0');

    expect(formatNumber(1, 'fullNumberWithCommas')).toEqual('1');
    expect(formatNumber(12, 'fullNumberWithCommas')).toEqual('12');
    expect(formatNumber(123, 'fullNumberWithCommas')).toEqual('123');
    expect(formatNumber(1234, 'fullNumberWithCommas')).toEqual('1,234');
    expect(formatNumber(12345, 'fullNumberWithCommas')).toEqual('12,345');
    expect(formatNumber(123456, 'fullNumberWithCommas')).toEqual('123,456');
    expect(formatNumber(1234567, 'fullNumberWithCommas')).toEqual('1,234,567');
    expect(formatNumber(12345678, 'fullNumberWithCommas'))
      .toEqual('12,345,678');
    expect(formatNumber(123456789, 'fullNumberWithCommas'))
      .toEqual('123,456,789');

    expect(formatNumber(123456.789, 'fullNumberWithCommas'))
      .toEqual('123,456.789');
  });

  it('returns proper number with word', () => {
    expect(formatNumber(0, 'numberAndWord')).toEqual('0');

    expect(formatNumber(1, 'numberAndWord')).toEqual('1');
    expect(formatNumber(12, 'numberAndWord')).toEqual('12');
    expect(formatNumber(123, 'numberAndWord')).toEqual('123');
    expect(formatNumber(1234, 'numberAndWord')).toEqual('1.23 thousand');
    expect(formatNumber(12345, 'numberAndWord')).toEqual('12.35 thousand');
    expect(formatNumber(123456, 'numberAndWord')).toEqual('123.46 thousand');
    expect(formatNumber(1234567, 'numberAndWord')).toEqual('1.23 million');
    expect(formatNumber(12345678, 'numberAndWord')).toEqual('12.35 million');
    expect(formatNumber(123456789, 'numberAndWord')).toEqual('123.46 million');
    expect(formatNumber(1234567891, 'numberAndWord')).toEqual('1.23 billion');
    expect(formatNumber(12345678912, 'numberAndWord')).toEqual('12.35 billion');
    expect(formatNumber(123456789123, 'numberAndWord'))
      .toEqual('123.46 billion');
    expect(formatNumber(1234567891234, 'numberAndWord'))
      .toEqual('1.23 trillion');
    expect(formatNumber(12345678912345, 'numberAndWord'))
      .toEqual('12.35 trillion');
    expect(formatNumber(123456789123456, 'numberAndWord'))
      .toEqual('123.46 trillion');
    expect(formatNumber(1234567891234567, 'numberAndWord'))
      .toEqual('1.23 quadrillion');
    expect(formatNumber(12345678912345678, 'numberAndWord'))
      .toEqual('12.35 quadrillion');
  });

  it('number with word handles decimal numbers', () => {
    expect(formatNumber(0.1234, 'numberAndWord')).toEqual('0.12');
    expect(formatNumber(123456.789, 'numberAndWord'))
      .toEqual('123.46 thousand');
  });
});

describe('getDurationEstimateFromBlockCount', () => {
  it('returns correct value for many orders of magnitude', () => {
    expect(getDurationEstimateFromBlockCount(1)).toEqual('10 minutes');
    expect(getDurationEstimateFromBlockCount(10))
      .toEqual('1 hour and 40 minutes');
    expect(getDurationEstimateFromBlockCount(100))
      .toEqual('16 hours and 40 minutes');
    expect(getDurationEstimateFromBlockCount(1000))
      .toEqual('6 days and 22 hours');
    expect(getDurationEstimateFromBlockCount(10000))
      .toEqual('69 days and 10 hours');
    expect(getDurationEstimateFromBlockCount(100000))
      .toEqual('1 year and 329 days');
    expect(getDurationEstimateFromBlockCount(1000000))
      .toEqual('19 years and 9 days');
    expect(getDurationEstimateFromBlockCount(10000000))
      .toEqual('190 years and 94 days');
  });

  it('uses singular values when appropriate', () => {
    expect(getDurationEstimateFromBlockCount(52710))
      .toEqual('1 year and 1 day');
  });

  it('truncates from the left side', () => {
    expect(getDurationEstimateFromBlockCount(52560))
      .toEqual('1 year and 0 days');
    expect(getDurationEstimateFromBlockCount(144))
      .toEqual('1 day and 0 hours');
    expect(getDurationEstimateFromBlockCount(6))
      .toEqual('1 hour and 0 minutes');
  });

  it('handles zero-block input', () => {
    expect(getDurationEstimateFromBlockCount(0)).toEqual('0 minutes');
  });

  it('truncates to maximum of 2 units', () => {
    expect(getDurationEstimateFromBlockCount(52559))
      .toEqual('364 days and 23 hours');
    expect(getDurationEstimateFromBlockCount(52560))
      .toEqual('1 year and 0 days');
  });
});

describe('getNextHalvingData', () => {
  it('returns correct value', () => {
    expect(getNextHalvingData(0)).toEqual({
      blockHeight: 210000,
      blockReward: new BitcoinAmount({coins: 25})
    });
    expect(getNextHalvingData(1)).toEqual({
      blockHeight: 210000,
      blockReward: new BitcoinAmount({coins: 25})
    });
    expect(getNextHalvingData(209999)).toEqual({
      blockHeight: 210000,
      blockReward: new BitcoinAmount({coins: 25})
    });
    expect(getNextHalvingData(210000)).toEqual({
      blockHeight: 420000,
      blockReward: new BitcoinAmount({coins: 12, sats: 50000000})
    });

    expect(getNextHalvingData(839999)).toEqual({
      blockHeight: 840000,
      blockReward: new BitcoinAmount({coins: 3, sats: 12500000})
    });
    expect(getNextHalvingData(840000)).toEqual({
      blockHeight: 1050000,
      blockReward: new BitcoinAmount({coins: 1, sats: 56250000})
    });
  });
});