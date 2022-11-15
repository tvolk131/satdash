import * as React from 'react';
import {formatNumber, getMinedBitcoinAmountFromBlockHeight} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface MarketCapWidgetProps {
  blockHeight: number,
  pricePerCoin: number
}

export const MarketCapWidget = (props: MarketCapWidgetProps) => {
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);

  return (
    <SimpleWidget
      headerText={'Market Cap'}
      mainText={`$${formatNumber(
        coinsMined.getTotalCoinAmount() * props.pricePerCoin,
        'numberAndWord'
      )}`}
    />
  );
};