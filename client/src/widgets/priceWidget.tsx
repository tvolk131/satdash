import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {formatNumber} from '../helper';

interface PriceWidgetProps {
  pricePerCoin: number
}

export const PriceWidget = (props: PriceWidgetProps) => {
  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>Current Price</Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>${formatNumber(props.pricePerCoin, 'fullNumberWithCommas')}</Typography>
        </div>
      </Paper>
    </div>
  );
};