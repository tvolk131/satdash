import * as React from 'react';
import {getMinedBitcoinAmountFromBlockHeight, truncateNumber} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface GoldSupplyParityWidgetProps {
  blockHeight: number
}

export const GoldSupplyParityWidget = (props: GoldSupplyParityWidgetProps) => {
  // TODO - Pull this figure from an API rather than using a hardcoded value.
  // Currently the values are hardcoded from:
  // https://companiesmarketcap.com/gold/marketcap/.
  const goldSupplyMetricTons = 205238;

  const poundsPerMetricTon = 2204.62;
  const goldSupplyPounds = goldSupplyMetricTons * poundsPerMetricTon;
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);
  const poundsOfGoldPerBitcoin =
    goldSupplyPounds / coinsMined.getTotalCoinAmount();

  return (
    <SimpleWidget
      headerText={'Gold Supply Equivalent'}
      mainText={`${truncateNumber(poundsOfGoldPerBitcoin, 2)} pounds`}
      description={
        'A supply-to-supply measurement of how much above-ground gold exists ' +
        'for every Bitcoin that has been mined. Put another way, if ' +
        'Bitcoin\'s market cap was identical to that of gold, one Bitcoin '+
        'would buy you this much gold.'
      }
    />
  );
};