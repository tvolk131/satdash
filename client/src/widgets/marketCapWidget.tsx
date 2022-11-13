import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {formatNumber, getMinedBitcoinAmountFromBlockHeight} from '../helper';

interface MarketCapWidgetProps {
  blockHeight: number,
  pricePerCoin: number
}

export const MarketCapWidget = (props: MarketCapWidgetProps) => {
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography
            variant={'h4'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            Market Cap
          </Typography>
          <Typography
            variant={'h2'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            ${
              formatNumber(
                  coinsMined.getTotalCoinAmount() * props.pricePerCoin,
                  'numberAndWord'
              )
            }
          </Typography>
        </div>
      </Paper>
    </div>
  );
};