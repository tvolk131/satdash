import * as React from 'react';
import {Typography} from '@mui/material';
import {Widget} from './widget';

export const ErrorWidget = () => (
  <Widget>
    <Typography>
      An error occured, try refreshing the page
    </Typography>
  </Widget>
);