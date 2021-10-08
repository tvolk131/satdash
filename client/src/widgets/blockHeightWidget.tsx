import * as React from 'react';
import {Paper, Typography} from '@mui/material';

interface BlockHeightWidgetProps {
  blockHeight: number
}

export const BlockHeightWidget = (props: BlockHeightWidgetProps) => {
  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '124px 0'}}>
          <Typography variant={'h4'} style={{padding: '10px', textAlign: 'center'}}>Current Block Height</Typography>
          <Typography variant={'h2'} style={{padding: '10px', textAlign: 'center'}}>{props.blockHeight}</Typography>
        </div>
      </Paper>
    </div>
  );
};