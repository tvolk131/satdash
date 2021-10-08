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