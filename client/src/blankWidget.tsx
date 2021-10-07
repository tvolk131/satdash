import * as React from 'react';
import {Card} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';

export const BlankWidget = () => {
  return (
    <div style={{padding: '10px'}}>
      <Card style={{height: '400px', width: '400px', position: 'relative'}}>
        <AddIcon style={{position: 'absolute', top: '50%', left: '50%', transform: 'translateY(-50%) translateX(-50%)'}}/>
      </Card>
    </div>
  );
};