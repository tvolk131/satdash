import * as React from 'react';
import {Card, Typography} from '@mui/material';

export const ErrorWidget = () => {
  return (
    <div style={{padding: '10px'}}>
      <Card style={{height: '400px', width: '400px', position: 'relative'}}>
        <Typography>An error occured, try refreshing the page</Typography>
      </Card>
    </div>
  );
};