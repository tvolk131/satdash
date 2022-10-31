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

export const getBlockRewardFromBlockHeight = (blockHeight: number): number => {
  let blockReward = 50;

  while (blockHeight > blockHalvingCount) {
    blockHeight -= blockHalvingCount;
    blockReward /= 2;
  }

  return blockReward;
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

export const formatNumber =
(num: number, format: 'fullNumberWithCommas' | 'numberAndWord'): string => {
  if (format === 'fullNumberWithCommas') {
    const parts = `${num}`.split('.');
    let whole = parts[0];
    const fraction = parts[1];
    whole = `${whole}`
        .split('')
        .reverse()
        .join('')
        .match(/.{1,3}/g)!
        .join(',')
        .split('')
        .reverse()
        .join('');
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

  return `${truncateNumber(num, 2)} ${wordSuffixes[wordSuffixIndex]}`;
};

const getDurationEstimateObjectFromBlockCount = (blockCount: number) => {
  let minutes = blockCount * 10;

  let years = 0;

  while (minutes >= 525600) {
    years += 1;
    minutes -= 525600;
  }

  let days = 0;

  while (minutes >= 1440) {
    days += 1;
    minutes -= 1440;
  }

  let hours = 0;

  while (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }

  return {years, days, hours, minutes};
};

const pluralizeIfNotOne = (amount: number, unit: string): string => {
  if (amount < 0) {
    return `-${pluralizeIfNotOne(amount * -1, unit)}`;
  }

  if (amount === 1) {
    return `${amount} ${unit}`;
  } else {
    return `${amount} ${unit}s`;
  }
};

const getDurationEstimateStringChunks = (blockCount: number): string[] => {
  const {
    years,
    days,
    hours,
    minutes
  } = getDurationEstimateObjectFromBlockCount(blockCount);

  const stringChunks = [];

  if (years >= 1) {
    stringChunks.push(pluralizeIfNotOne(years, 'year'));
  }

  if (days >= 1 || stringChunks.length) {
    stringChunks.push(pluralizeIfNotOne(days, 'day'));
  }

  if (hours >= 1 || stringChunks.length) {
    stringChunks.push(pluralizeIfNotOne(hours, 'hour'));
  }

  stringChunks.push(pluralizeIfNotOne(minutes, 'minute'));

  return stringChunks;
};

export const getDurationEstimateFromBlockCount = (blockCount: number): string => {
  const stringChunks = getDurationEstimateStringChunks(blockCount);

  if (stringChunks.length === 1) {
    return stringChunks[0];
  }

  while (stringChunks.length > 3) {
    stringChunks.pop();
  }

  const lastChunk = stringChunks.pop();

  return [stringChunks.join(', '), lastChunk].join(' and ');
};

export const getNextHalvingData =
(blockHeight: number): {blockHeight: number, blockReward: number} => {
  let nextHalvingHeight = 210000;
  let nextBlockReward = 25;

  while (nextHalvingHeight <= blockHeight) {
    nextHalvingHeight += 210000;
    nextBlockReward /= 2;
  }

  return {blockHeight: nextHalvingHeight, blockReward: nextBlockReward};
};