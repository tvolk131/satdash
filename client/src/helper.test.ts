import {getMinedBitcoinAmountFromBlockHeight, truncateNumber, formatNumber} from './helper';

describe('getMinedBitcoinAmountFromBlockHeight', () => {
  it('returns correct value for intial block heights', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(0)).toEqual(0);
    expect(getMinedBitcoinAmountFromBlockHeight(1)).toEqual(50);
  });

  it('returns correct value between each halving', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(210000)).toEqual(10500000);
    expect(getMinedBitcoinAmountFromBlockHeight(210001)).toEqual(10500025);

    expect(getMinedBitcoinAmountFromBlockHeight(420000)).toEqual(15750000);
    expect(getMinedBitcoinAmountFromBlockHeight(420001)).toEqual(15750012.5);

    expect(getMinedBitcoinAmountFromBlockHeight(630000)).toEqual(18375000);
    expect(getMinedBitcoinAmountFromBlockHeight(630001)).toEqual(18375006.25);

    expect(getMinedBitcoinAmountFromBlockHeight(840000)).toEqual(19687500);
    expect(getMinedBitcoinAmountFromBlockHeight(840001)).toEqual(19687503.125);
  });

  it('converges on 21,000,000 coins', () => {
    expect(getMinedBitcoinAmountFromBlockHeight(100000000)).toEqual(21000000);
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
    expect(formatNumber(12345678, 'fullNumberWithCommas')).toEqual('12,345,678');
    expect(formatNumber(123456789, 'fullNumberWithCommas')).toEqual('123,456,789');
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
    expect(formatNumber(123456789123, 'numberAndWord')).toEqual('123.46 billion');
    expect(formatNumber(1234567891234, 'numberAndWord')).toEqual('1.23 trillion');
    expect(formatNumber(12345678912345, 'numberAndWord')).toEqual('12.35 trillion');
    expect(formatNumber(123456789123456, 'numberAndWord')).toEqual('123.46 trillion');
    expect(formatNumber(1234567891234567, 'numberAndWord')).toEqual('1.23 quadrillion');
    expect(formatNumber(12345678912345678, 'numberAndWord')).toEqual('12.35 quadrillion');
    expect(formatNumber(123456789123456789, 'numberAndWord')).toEqual('123.46 quadrillion');
  });

  it('number with word handles decimal numbers', () => {
    expect(formatNumber(0.1234, 'numberAndWord')).toEqual('0.12');
    expect(formatNumber(123456.789, 'numberAndWord')).toEqual('123.46 thousand');
  });
});