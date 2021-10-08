import {blue, teal} from '@mui/material/colors';
import {
  createTheme,
  ThemeProvider,
  Theme
} from '@mui/material/styles';
import {
  makeStyles
} from '@mui/styles';
import * as React from 'react';
import {useState} from 'react';
import {Snackbar, Box, Grid} from '@mui/material';
import {BlankWidget} from './blankWidget';
import {TotalSupplyPieChartWidget} from './totalSupplyPieChartWidget';
import {TaprootCountdownWidget} from './taprootCountdownWidget';
import {BlockHeightWidget} from './blockHeightWidget';
import {PriceWidget} from './priceWidget';

const blockHeight = 704041;
const pricePerCoin = 54695;

const useStyles = makeStyles((theme: Theme) =>
  ({
    root: {
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }
  })
);

const SubApp = () => {
  const classes = useStyles();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true);
    setSnackbarMessage(message);
  };

  const widgets = [
    <TotalSupplyPieChartWidget blockHeight={blockHeight}/>,
    <TaprootCountdownWidget blockHeight={blockHeight}/>,
    <BlockHeightWidget blockHeight={blockHeight}/>,
    <PriceWidget pricePerCoin={pricePerCoin}/>,
    <TotalSupplyPieChartWidget blockHeight={blockHeight}/>,
    <BlankWidget/>
  ];

  return (
    <div className={classes.root}>
      {/* This meta tag makes the mobile experience
      much better by preventing text from being tiny. */}
      <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
      <div>
        <div>
          <Box sx={{flexGrow: 1}} style={{maxWidth: '1500px', margin: 'auto', padding: '20px'}}>
            <Grid container spacing={2} justifyContent={'center'}>
              {widgets.map((widget, index) => (
                <Grid item key={index}>
                  {widget}
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={(event, reason) => {
          if (reason !== 'clickaway') {
            setShowSnackbar(false);
          }
        }}
        message={snackbarMessage}
      />
    </div>
  );
};

const ThemedSubApp = () => {
  const isDarkMode = true; // TODO - Add a way for users to be able to set this.

  const theme = createTheme({
    palette: {
      primary: blue,
      secondary: teal,
      mode: isDarkMode ? 'dark' : 'light'
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <SubApp/>
    </ThemeProvider>
  );
};

export const App = () => (
  <ThemedSubApp/>
);