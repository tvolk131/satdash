import * as React from 'react';
import {SimpleWidget} from './simpleWidget';
import {formatNumber} from '../helper';

interface PriceWidgetProps {
  pricePerCoin: number
}

export const PriceWidget = (props: PriceWidgetProps) => (
  <SimpleWidget
    headerText={'Current Price'}
    mainText={`$${formatNumber(props.pricePerCoin, 'fullNumberWithCommas')}`}
  />
);