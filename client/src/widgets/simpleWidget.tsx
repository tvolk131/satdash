import * as React from 'react';
import {Paper, Typography} from '@mui/material';

interface SimpleWidgetProps {
  headerText: string,
  mainText: string
}

export const SimpleWidget = (props: SimpleWidgetProps) => (
  <div style={{padding: '10px'}}>
    <Paper style={{height: '400px', width: '400px'}}>
      <div style={{padding: '124px 0'}}>
        <Typography
          variant={'h4'}
          style={{padding: '10px', textAlign: 'center'}}
        >
          {props.headerText}
        </Typography>
        <Typography
          variant={'h2'}
          style={{padding: '10px', textAlign: 'center'}}
        >
          {props.mainText}
        </Typography>
      </div>
    </Paper>
  </div>
);