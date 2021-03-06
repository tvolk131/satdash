import * as React from 'react';
import {Card, CircularProgress} from '@mui/material';

const spinnerSize = 100;

export const LoadingWidget = () => {
  return (
    <div style={{padding: '10px'}}>
      <Card style={{height: '400px', width: '400px', position: 'relative'}}>
        <CircularProgress size={spinnerSize} style={{position: 'absolute', padding: `${(400 - spinnerSize) / 2}px`}}/>
      </Card>
    </div>
  );
};