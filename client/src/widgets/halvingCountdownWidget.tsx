import * as React from 'react';
import {Paper, Typography, useTheme} from '@mui/material';
import {getDurationEstimateFromBlockCount, getNextHalvingData} from '../helper';

interface HalvingCountdownWidgetProps {
  blockHeight: number
}

export const HalvingCountdownWidget = (props: HalvingCountdownWidgetProps) => {
  const nextHalvingData = getNextHalvingData(props.blockHeight);
  const blocksUntilHalving = nextHalvingData.blockHeight - props.blockHeight;
  const halvingProgressPercentage = 100 - (blocksUntilHalving / 210000 * 100);
  const progressBarHeightPx = 55;

  const theme = useTheme();

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '53px 0'}}>
          <Typography variant={'h4'} style={{padding: '0 10px 10px 10px', textAlign: 'center'}}>
            Next Halving
          </Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>
            {blocksUntilHalving} blocks
          </Typography>
          <Typography style={{padding: '10px', textAlign: 'center'}}>
            Approximately {getDurationEstimateFromBlockCount(blocksUntilHalving)}
          </Typography>
          <Typography variant={'h6'} style={{padding: '10px', textAlign: 'center'}}>
            Block reward will be reduced to ₿{nextHalvingData.blockReward}
          </Typography>
          <div style={{position: 'relative', height: `${progressBarHeightPx}px`, margin: '0 20px'}}>
            <Paper style={{position: 'absolute', height: `${progressBarHeightPx}px`, width: '100%'}} elevation={5}/>
            <Paper style={{position: 'absolute', height: `${progressBarHeightPx}px`, width: `${halvingProgressPercentage}%`, backgroundColor: theme.palette.primary.main}}/>
          </div>
        </div>
      </Paper>
    </div>
  );
};