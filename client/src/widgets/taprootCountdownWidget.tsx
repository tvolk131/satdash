import * as React from 'react';
import {Paper, Typography} from '@mui/material';

const taprootBlockHeight = 709632;

const getDurationEstimateFromBlockCount = (blockCount: number): string => {
  let minutes = blockCount * 10;

  let years = 0;

  while (minutes >= 525600) {
    years += 1;
    minutes -= 525600;
  }

  let days = 0;

  while (minutes >= 1440) {
    days += 1;
    minutes -= 1440;
  }

  let hours = 0;

  while (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }

  return `${years ? `${years} years, ` : ''}${days} days, ${hours} hours, and ${minutes} minutes`;
}

interface TaprootCountdownWidgetProps {
  blockHeight: number
}

export const TaprootCountdownWidget = (props: TaprootCountdownWidgetProps) => {
  const blocksUntilTaproot = taprootBlockHeight - props.blockHeight;
  const taprootHasActivated = blocksUntilTaproot <= 0;

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        {taprootHasActivated ? (
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>Taproot has activated!</Typography>
        ) : (
          <div style={{padding: '75px 0'}}>
            <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>Taproot Activation</Typography>
            <Typography variant={'h6'} style={{padding: '10px', textAlign: 'center'}}>will occur in</Typography>
            <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>{taprootBlockHeight - props.blockHeight} blocks</Typography>
            <Typography style={{padding: '10px', textAlign: 'center'}}>Approximately {getDurationEstimateFromBlockCount(blocksUntilTaproot)}</Typography>
          </div>
        )}
      </Paper>
    </div>
  );
};