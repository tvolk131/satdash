import * as React from 'react';
import {SimpleWidget} from './simpleWidget';

interface BlockHeightWidgetProps {
  blockHeight: number
}

export const BlockHeightWidget = (props: BlockHeightWidgetProps) => {
  return (
    <SimpleWidget
      headerText={'Current Block Height'}
      mainText={`${props.blockHeight}`}
    />
  );
};