import * as React from 'react';
import {Box, Grid, Paper, Snackbar, Typography} from '@mui/material';
import {Theme, ThemeProvider, createTheme} from '@mui/material/styles';
import {getBitcoinBlockHeight, getBitcoinPrice} from './api';
import {useCallback, useEffect, useState} from 'react';
import {BPIDatasetExplorer} from './BPIDatasetExplorer';
import {BlockHeightWidget} from './widgets/blockHeightWidget';
import {ErrorWidget} from './widgets/errorWidget';
import {HalvingCountdownWidget} from './widgets/halvingCountdownWidget';
import {InflationRateWidget} from './widgets/inflationRateWidget';
import {LoadingWidget} from './widgets/loadingWidget';
import {MarketCapWidget} from './widgets/marketCapWidget';
import {PriceWidget} from './widgets/priceWidget';
import {SatsPerDollarWidget} from './widgets/satsPerDollarWidget';
import {StockToFlowWidget} from './widgets/stockToFlowWidget';
import {TotalSupplyPieChartWidget} from './widgets/totalSupplyPieChartWidget';
import {blue} from '@mui/material/colors';
import {makeStyles} from '@mui/styles';

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

  const [pricePerCoin, setPricePerCoin] =
    useState<number | null | undefined>(undefined);
  const [blockHeight, setBlockHeight] =
    useState<number | null | undefined>(undefined);

  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Used to force-update the component.
  // The state itself isn't used for anything.
  const [, updateState] = useState<any>();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const loadData = () => {
      const pricePromise = getBitcoinPrice()
        .then((pricePerCoin) => setPricePerCoin(pricePerCoin))
        .catch(() => setPricePerCoin(null));

      const blockHeightPromise = getBitcoinBlockHeight()
        .then((blockHeight) => setBlockHeight(blockHeight))
        .catch(() => setBlockHeight(null));

      Promise.all([pricePromise, blockHeightPromise])
        .then(() => setLastUpdated(Date.now()));
    };
    const intervalId = setInterval(loadData, 30000);
    loadData();
    return () => clearInterval(intervalId);
  }, []);

  // Used to force update the component.
  useEffect(() => {
    const intervalId = setInterval(() => {
      forceUpdate();
    }, 200);
    return () => clearInterval(intervalId);
  }, []);

  // TODO - Use this for displaying errors and warnings to the user.
  const _showSnackbarMessage = (message: string) => {
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

  const priceWidget = (() => {
    if (pricePerCoin === null) {
      return <ErrorWidget/>;
    } else if (pricePerCoin === undefined) {
      return <LoadingWidget/>;
    } else {
      return <PriceWidget pricePerCoin={pricePerCoin}/>;
    }
  })();

  const halvingCountdownWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <HalvingCountdownWidget blockHeight={blockHeight}/>;
    }
  })();

  const stockToFlowWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <StockToFlowWidget blockHeight={blockHeight}/>;
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
      return (
        <MarketCapWidget
          blockHeight={blockHeight}
          pricePerCoin={pricePerCoin}
        />
      );
    }
  })();

  const inflationRateWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <InflationRateWidget blockHeight={blockHeight}/>;
    }
  })();

  const widgets = [
    totalSupplyPieChartWidget,
    priceWidget,
    halvingCountdownWidget,
    stockToFlowWidget,
    blockHeightWidget,
    satsPerDollarWidget,
    marketCapWidget,
    inflationRateWidget
  ];

  const lastUpdateDurationSeconds =
    Math.floor((Date.now() - lastUpdated) / 1000);

  return (
    <div className={classes.root}>
      {/* This meta tag makes the mobile experience
      much better by preventing text from being tiny. */}
      <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
      <div>
        <div>
          <Box
            sx={{flexGrow: 1}}
            style={{maxWidth: '1500px', margin: 'auto', padding: '20px'}}
          >
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
      <BPIDatasetExplorer/>
      <Paper style={{position: 'fixed', bottom: 0, right: 0, margin: '20px'}}>
        <Typography
          variant={'h5'}
          style={{padding: '10px'}}
        >
          Last updated {lastUpdateDurationSeconds} seconds ago
        </Typography>
      </Paper>
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
      primary: {main: '#F7931A'},
      secondary: blue,
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