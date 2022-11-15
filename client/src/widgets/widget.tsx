import * as React from 'react';
import {Paper} from '@mui/material';

interface WidgetProps {
  children?: JSX.Element | JSX.Element[]
}

export const Widget = (props: WidgetProps) => (
  <div style={{padding: '10px'}}>
    <Paper style={{height: '400px', width: '400px'}}>
      {props.children}
    </Paper>
  </div>
);