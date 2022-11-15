import * as React from 'react';
import {
  getBlockRewardFromBlockHeight,
  getMinedBitcoinAmountFromBlockHeight,
  truncateNumber
} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface StockToFlowWidgetProps {
  blockHeight: number
}

export const StockToFlowWidget = (props: StockToFlowWidgetProps) => {
  const blockReward = getBlockRewardFromBlockHeight(props.blockHeight);
  const currentAnnualizedBlockRewards = blockReward.multiply(144 * 365);
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);

  return (
    <SimpleWidget
      headerText={'Stock to Flow'}
      mainText={`${
        truncateNumber(
          coinsMined.getRatio(currentAnnualizedBlockRewards),
          2
        )
      }`}
    />
  );
};