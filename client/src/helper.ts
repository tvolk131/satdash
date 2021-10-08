// A Bitcoin halving occurs every 210000 blocks.
const blockHalvingCount = 210000;

export const getMinedBitcoinAmountFromBlockHeight = (blockHeight: number): number => {
  let bitcoinAmount = 0;
  let blockReward = 50;

  while (blockHeight > blockHalvingCount) {
    blockHeight -= blockHalvingCount;
    bitcoinAmount += blockReward * blockHalvingCount;
    blockReward /= 2;
  }

  bitcoinAmount += blockHeight * blockReward;

  return bitcoinAmount;
};

export const truncateNumber = (num: number, digits: number): number => {
  if (digits < 0) {
    let divisionFactor = 1;
    for (let i = digits; i < 0; i++) {
      divisionFactor *= 10;
    }
    num /= divisionFactor;
    num = Math.round(num);
    for (let i = digits; i < 0; i++) {
      num *= 10;
    }
    return num;
  }

  for (let i = 0; i < digits; i++) {
    num *= 10;
  }
  num = Math.round(num);
  let divisionFactor = 1;
  for (let i = 0; i < digits; i++) {
    divisionFactor *= 10;
  }
  return num / divisionFactor;
};

export const formatNumber = (num: number, format: 'fullNumberWithCommas' | 'numberAndWord'): string => {
  if (format === 'fullNumberWithCommas') {
    let [whole, fraction] = `${num}`.split('.');
    whole = `${whole}`.split('').reverse().join('').match(/.{1,3}/g)!.join(',').split('').reverse().join('');
    return `${whole}${fraction ? `.${fraction}` : ''}`;
  }

  const wordSuffixes = ['thousand', 'million', 'billion', 'trillion', 'quadrillion'];

  let wordSuffixIndex = -1;

  while (num >= 1000) {
    wordSuffixIndex += 1;
    num /= 1000;
  }

  if (wordSuffixIndex === -1) {
    return `${truncateNumber(num, 2)}`;
  }

  const wordSuffix = wordSuffixes[wordSuffixIndex];

  return `${truncateNumber(num, 2)} ${wordSuffixes[wordSuffixIndex]}`;
};