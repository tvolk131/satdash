import * as React from 'react';
import {Typography} from '@mui/material';
import {Widget} from './widget';

export const ErrorWidget = () => (
  <Widget>
    {/* TODO - Make it more visually clear that there is an error.
        Maybe make the text red, or show a warning icon.
     */}
    <Typography variant={'h4'} style={{padding: '158px 20px'}}>
      An error occured, try refreshing the page
    </Typography>
  </Widget>
);