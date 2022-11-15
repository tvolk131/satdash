import * as React from 'react';
import {SimpleWidget} from './simpleWidget';

interface SatsPerDollarWidgetProps {
  pricePerCoin: number
}

export const SatsPerDollarWidget = (props: SatsPerDollarWidgetProps) => (
  <SimpleWidget
    headerText={'Sats / Dollar'}
    mainText={`${Math.round(1 / props.pricePerCoin * 100000000)}`}
  />
);