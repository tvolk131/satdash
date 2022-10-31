import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {
  getBlockRewardFromBlockHeight,
  getMinedBitcoinAmountFromBlockHeight,
  truncateNumber
} from '../helper';

interface InflationRateWidgetProps {
  blockHeight: number
}

export const InflationRateWidget = (props: InflationRateWidgetProps) => {
  const currentAnnualizedBlockRewards =
      getBlockRewardFromBlockHeight(props.blockHeight) * 144 * 365;
  const inflationRate =
      currentAnnualizedBlockRewards / getMinedBitcoinAmountFromBlockHeight(props.blockHeight) * 100;

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>
            Annual Inflation Rate
          </Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>
            {truncateNumber(inflationRate, 4)}%
          </Typography>
        </div>
      </Paper>
    </div>
  );
};