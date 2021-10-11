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
    const parts = `${num}`.split('.');
    let whole = parts[0];
    const fraction = parts[1];
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

export const getDurationEstimateFromBlockCount = (blockCount: number): string => {
  const {
    years,
    days,
    hours,
    minutes
  } = getDurationEstimateObjectFromBlockCount(blockCount);

  const stringChunks = [];

  if (years === 1) {
    stringChunks.push(`${years} year`);
  } else if (years > 1) {
    stringChunks.push(`${years} years`);
  }

  if (days === 1) {
    stringChunks.push(`${days} day`);
  } else if (days > 1 || (days === 0 && stringChunks.length)) {
    stringChunks.push(`${days} days`);
  }

  if (hours === 1) {
    stringChunks.push(`${hours} hour`);
  } else if (hours > 1 || (hours === 0 && stringChunks.length)) {
    stringChunks.push(`${hours} hours`);
  }

  if (minutes === 1) {
    stringChunks.push(`${minutes} minute`);
  } else if (minutes > 1 || (minutes === 0 && stringChunks.length)) {
    stringChunks.push(`${minutes} minutes`);
  }

  if (stringChunks.length === 0) {
    return '0 minutes'
  } else if (stringChunks.length === 1) {
    return stringChunks[0];
  }

  const lastChunk = stringChunks.pop();

  return [stringChunks.join(', '), lastChunk].join(' and ');
};