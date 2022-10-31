import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {
  getBlockRewardFromBlockHeight,
  getMinedBitcoinAmountFromBlockHeight,
  truncateNumber
} from '../helper';

interface StockToFlowWidgetProps {
  blockHeight: number
}

export const StockToFlowWidget = (props: StockToFlowWidgetProps) => {
  const blockReward = getBlockRewardFromBlockHeight(props.blockHeight);
  const currentAnnualizedBlockRewards = blockReward * 144 * 365;
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography
            variant={'h4'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            Stock to Flow
          </Typography>
          <Typography
            variant={'h2'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            {truncateNumber(coinsMined / currentAnnualizedBlockRewards, 2)}
          </Typography>
        </div>
      </Paper>
    </div>
  );
};