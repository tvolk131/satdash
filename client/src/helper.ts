import {BitcoinAmount} from './bitcoin';

// A Bitcoin halving occurs every 210000 blocks.
const blockHalvingCount = 210000;

export const getMinedBitcoinAmountFromBlockHeight =
(blockHeight: number): BitcoinAmount => {
  let bitcoinAmount = new BitcoinAmount();
  let blockRewardSats = 50 * 100000000;

  while (blockHeight > blockHalvingCount && blockRewardSats > 0) {
    blockHeight -= blockHalvingCount;
    bitcoinAmount.addRaw({sats: blockRewardSats * blockHalvingCount});
    blockRewardSats = Math.floor(blockRewardSats / 2);
  }

  bitcoinAmount.addRaw({sats: blockHeight * blockRewardSats});
  return bitcoinAmount;
};

export const totalBitcoin = getMinedBitcoinAmountFromBlockHeight(6930000);

export const maxBlockHeightWithReward = 6929999;

export const getBlockRewardFromBlockHeight =
(blockHeight: number): BitcoinAmount => {
  let blockRewardSats = 50 * 100000000;

  while (blockHeight >= blockHalvingCount && blockRewardSats > 0) {
    blockHeight -= blockHalvingCount;
    blockRewardSats = Math.floor(blockRewardSats /= 2);
  }

  return new BitcoinAmount({sats: blockRewardSats});
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

  const wordSuffixes = [
    'thousand',
    'million',
    'billion',
    'trillion',
    'quadrillion'
  ];

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

export const pluralizeIfNotOne = (amount: number, unit: string): string => {
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

export const getDurationEstimateFromBlockCount =
(blockCount: number): string => {
  const stringChunks = getDurationEstimateStringChunks(blockCount);

  if (stringChunks.length === 1) {
    return stringChunks[0];
  }

  while (stringChunks.length > 2) {
    stringChunks.pop();
  }

  const lastChunk = stringChunks.pop();

  return [stringChunks.join(', '), lastChunk].join(' and ');
};

export const getNextHalvingData =
(blockHeight: number): {blockHeight: number, blockReward: BitcoinAmount} => {
  let nextHalvingHeight = 210000;
  let nextBlockReward = new BitcoinAmount({coins: 25});

  while (nextHalvingHeight <= blockHeight) {
    nextHalvingHeight += 210000;
    nextBlockReward = nextBlockReward.floorDivide(2);
  }

  return {blockHeight: nextHalvingHeight, blockReward: nextBlockReward};
};

// Estimated world population at various block heights going back to the genesis
// block. Block heights are for roughly the beginning of each calendar year.
// Population estimates are for the year as a whole. Sorted by block height
// because we'll be using binary search to find the closest block height to the
// current block height.
const worldPopulationAtBlockHeights: {
  blockHeight: number;
  population: number;
}[] = [
  {blockHeight: 1, population: 6.898}, // January 2009.
  {blockHeight: 33000, population: 6.985}, // January 2010.
  {blockHeight: 101000, population: 7.073}, // January 2011.
  {blockHeight: 161000, population: 7.161}, // January 2012.
  {blockHeight: 216000, population: 7.250}, // January 2013.
  {blockHeight: 279000, population: 7.339}, // January 2014.
  {blockHeight: 338000, population: 7.426}, // January 2015.
  {blockHeight: 392000, population: 7.513}, // January 2016.
  {blockHeight: 447000, population: 7.599}, // January 2017.
  {blockHeight: 503000, population: 7.683}, // January 2018.
  {blockHeight: 557000, population: 7.764}, // January 2019.
  {blockHeight: 612000, population: 7.840}, // January 2020.
  {blockHeight: 665000, population: 7.909}, // January 2021.
  {blockHeight: 718000, population: 7.975}, // January 2022.
  {blockHeight: 771000, population: 8.045} // January 2023.
].sort((a, b) => a.blockHeight - b.blockHeight);

const estimatedFuturePopulationGrowthRateMultiplier = 1.0088;

const estimatedBlocksPerYear = 210000 / 4;

// Estimate the world population at the given block height using linear
// interpolation between the closest two known block heights, or extrapolation
// if the block height is beyond the last known block height.
// TODO - Pull data from an API or use the block height to calculate a more
// accurate estimate.
export const getEstimatedWorldPopulationBillionsAtBlockHeight = (
  blockHeight: number
) => {
  return truncateNumber(
    getEstimatedWorldPopulationBillionsAtBlockHeightInternal(blockHeight), 3
  );
};

const getEstimatedWorldPopulationBillionsAtBlockHeightInternal = (
  blockHeight: number
): number => {
  // Zero or negative block height doesn't make sense.
  if (blockHeight < 1) {
    return -1;
  }

  // If the block height is before the first known block height, return the
  // population at the first known block height.
  if (blockHeight <= worldPopulationAtBlockHeights[0].blockHeight) {
    return worldPopulationAtBlockHeights[0].population;
  }

  // If the block height is after the last known block height, extrapolate the
  // population using the last known population and the estimated future
  // population growth rate multiplier.
  if (
    blockHeight >=
    worldPopulationAtBlockHeights[worldPopulationAtBlockHeights.length - 1]
      .blockHeight
  ) {
    return (
      worldPopulationAtBlockHeights[worldPopulationAtBlockHeights.length - 1]
        .population *
      estimatedFuturePopulationGrowthRateMultiplier **
        ((blockHeight -
          worldPopulationAtBlockHeights[
            worldPopulationAtBlockHeights.length - 1]
            .blockHeight) / estimatedBlocksPerYear)
    );
  }

  // Otherwise, find the closest two known block heights and interpolate the
  // population between them.
  for (let i = 0; i < worldPopulationAtBlockHeights.length - 1; i++) {
    if (
      blockHeight >= worldPopulationAtBlockHeights[i].blockHeight &&
      blockHeight < worldPopulationAtBlockHeights[i + 1].blockHeight
    ) {
      const blockHeightDifference =
        worldPopulationAtBlockHeights[i + 1].blockHeight -
        worldPopulationAtBlockHeights[i].blockHeight;
      const populationDifference =
        worldPopulationAtBlockHeights[i + 1].population -
        worldPopulationAtBlockHeights[i].population;
      const blockHeightDifferenceFromStart =
        blockHeight - worldPopulationAtBlockHeights[i].blockHeight;
      const populationDifferenceFromStart =
        (blockHeightDifferenceFromStart / blockHeightDifference) *
        populationDifference;
      return (
        worldPopulationAtBlockHeights[i].population +
        populationDifferenceFromStart
      );
    }
  }

  // If we get here, something went wrong.
  return -1;
};
