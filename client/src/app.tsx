import {blue, teal} from '@mui/material/colors';
import {createTheme, ThemeProvider, Theme} from '@mui/material/styles';
import {makeStyles} from '@mui/styles';
import * as React from 'react';
import {useState, useEffect} from 'react';
import {Snackbar, Box, Grid} from '@mui/material';
import {TotalSupplyPieChartWidget} from './totalSupplyPieChartWidget';
import {TaprootCountdownWidget} from './taprootCountdownWidget';
import {BlockHeightWidget} from './blockHeightWidget';
import {PriceWidget} from './priceWidget';
import {SatsPerDollarWidget} from './satsPerDollarWidget';
import {MarketCapWidget} from './marketCapWidget';
import {LoadingWidget} from './loadingWidget';
import {ErrorWidget} from './errorWidget';
import {getBitcoinPrice, getBitcoinBlockHeight} from './api';

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

  const [pricePerCoin, setPricePerCoin] = useState<number | null | undefined>(undefined);
  const [blockHeight, setBlockHeight] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    getBitcoinPrice()
      .then((pricePerCoin) => setPricePerCoin(pricePerCoin))
      .catch(() => setPricePerCoin(null));

    getBitcoinBlockHeight()
      .then((blockHeight) => setBlockHeight(blockHeight))
      .catch(() => setBlockHeight(null));
  }, []);

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true);
    setSnackbarMessage(message);
  };

  const totalSupplyPieChartWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <TotalSupplyPieChartWidget blockHeight={blockHeight}/>;
    }
  })();

  const taprootCountdownWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <TaprootCountdownWidget blockHeight={blockHeight}/>;
    }
  })();

  const blockHeightWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <BlockHeightWidget blockHeight={blockHeight}/>;
    }
  })();

  const priceWidget = (() => {
    if (pricePerCoin === null) {
      return <ErrorWidget/>;
    } else if (pricePerCoin === undefined) {
      return <LoadingWidget/>;
    } else {
      return <PriceWidget pricePerCoin={pricePerCoin}/>;
    }
  })();

  const satsPerDollarWidget = (() => {
    if (pricePerCoin === null) {
      return <ErrorWidget/>;
    } else if (pricePerCoin === undefined) {
      return <LoadingWidget/>;
    } else {
      return <SatsPerDollarWidget pricePerCoin={pricePerCoin}/>;
    }
  })();

  const marketCapWidget = (() => {
    if (blockHeight === null || pricePerCoin === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined || pricePerCoin === undefined) {
      return <LoadingWidget/>;
    } else {
      return <MarketCapWidget blockHeight={blockHeight} pricePerCoin={pricePerCoin}/>;
    }
  })();

  const widgets = [
    totalSupplyPieChartWidget,
    taprootCountdownWidget,
    blockHeightWidget,
    priceWidget,
    satsPerDollarWidget,
    marketCapWidget
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