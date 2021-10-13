import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {getDurationEstimateFromBlockCount, getNextHalvingData} from '../helper';

interface HalvingCountdownWidgetProps {
  blockHeight: number
}

export const HalvingCountdownWidget = (props: HalvingCountdownWidgetProps) => {
  const nextHalvingData = getNextHalvingData(props.blockHeight);
  const blocksUntilHalving = nextHalvingData.blockHeight - props.blockHeight;

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '75px 0'}}>
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>
            Next Halving
          </Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>
            {nextHalvingData.blockHeight - props.blockHeight} blocks
          </Typography>
          <Typography style={{padding: '10px', textAlign: 'center'}}>
            Approximately {getDurationEstimateFromBlockCount(blocksUntilHalving)}
          </Typography>
          <Typography variant={'h6'} style={{padding: '10px', textAlign: 'center'}}>
            Block reward will be reduced to ₿{nextHalvingData.blockReward}
          </Typography>
        </div>
      </Paper>
    </div>
  );
};