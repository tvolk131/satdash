import * as React from 'react';
import {formatNumber} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface PriceWidgetProps {
  pricePerCoin: number
}

export const PriceWidget = (props: PriceWidgetProps) => (
  <SimpleWidget
    headerText={'Current Price'}
    mainText={`$${formatNumber(props.pricePerCoin, 'fullNumberWithCommas')}`}
  />
);