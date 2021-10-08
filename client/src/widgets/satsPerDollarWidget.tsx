import * as React from 'react';
import {Paper, Typography} from '@mui/material';

interface SatsPerDollarWidgetProps {
  pricePerCoin: number
}

export const SatsPerDollarWidget = (props: SatsPerDollarWidgetProps) => {
  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>
            Sats / Dollar
          </Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>
            {Math.round(1 / props.pricePerCoin * 100000000)}
          </Typography>
        </div>
      </Paper>
    </div>
  );
};