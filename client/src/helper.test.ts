import {getMinedBitcoinAmountFromBlockHeight} from './helper';

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