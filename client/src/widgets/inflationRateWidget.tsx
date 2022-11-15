import * as React from 'react';
import {
  getBlockRewardFromBlockHeight,
  getMinedBitcoinAmountFromBlockHeight,
  truncateNumber
} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface InflationRateWidgetProps {
  blockHeight: number
}

export const InflationRateWidget = (props: InflationRateWidgetProps) => {
  const blockReward = getBlockRewardFromBlockHeight(props.blockHeight);
  const currentAnnualizedBlockRewards = blockReward.multiply(144 * 365);
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);
  const inflationRate =
    currentAnnualizedBlockRewards.getRatio(coinsMined) * 100;

  return (
    <SimpleWidget
      headerText={'Annual Inflation Rate'}
      mainText={`${truncateNumber(inflationRate, 4)}%`}
    />
  );
};