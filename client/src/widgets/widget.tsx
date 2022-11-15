import * as React from 'react';
import {Paper} from '@mui/material';
import {ReactNode} from 'react';

interface WidgetProps {
  children?: ReactNode | ReactNode[]
}

export const Widget = (props: WidgetProps) => (
  <div style={{padding: '10px'}}>
    <Paper style={{height: '400px', width: '400px'}}>
      {props.children}
    </Paper>
  </div>
);