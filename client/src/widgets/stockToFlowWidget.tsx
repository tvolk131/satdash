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
  const stockToFlow = truncateNumber(
    coinsMined.getRatio(currentAnnualizedBlockRewards),
    2
  );

  return (
    <SimpleWidget
      headerText={'Stock to Flow'}
      mainText={`${stockToFlow}`}
      description={
        'The stock to flow of any commodity is a measure of supply growth in ' +
        'relation to existing supply. Measured as a unit of time - typically ' +
        'years - it represents how long it would take to double the supply ' +
        'given the current growth rate. For Bitcoin, it would take ' +
        stockToFlow + ' years to double the current mined supply assuming a ' +
        'constant growth rate (i.e. no more halvings). Bitcoin\'s halving ' +
        'cycles ensure that its stock to flow is ever increasing, eventually ' +
        'reaching infinity when the last coin is mined and the flow is ' +
        'reduced to zero.'
      }
    />
  );
};