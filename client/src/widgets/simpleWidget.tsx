import * as React from 'react';
import Typography from '@mui/material/Typography';
import {Widget} from './widget';

interface SimpleWidgetProps {
  headerText: string,
  mainText: string,
  backSideInfo?: {
    description: string,
    showInfoIcon: boolean
  }
}

export const SimpleWidget = (props: SimpleWidgetProps) => (
  <Widget backSideInfo={props.backSideInfo}>
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
  </Widget>
);