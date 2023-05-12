import * as React from 'react';
import {
  Box,
  Grid,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {Theme, ThemeProvider, createTheme} from '@mui/material/styles';
import {getBitcoinBlockHeight, getBitcoinPrice} from './api';
import {useEffect, useState} from 'react';
import {BPIDatasetExplorer} from './BPIDatasetExplorer';
import {BlockHeightWidget} from './widgets/blockHeightWidget';
import {
  DifficultyAdjustmentCountdownWidget
} from './widgets/difficultyAdjustmentCountdownWidget';
import {ErrorWidget} from './widgets/errorWidget';
import {GoldSupplyParityWidget} from './widgets/goldSupplyParityWidget';
import {HalvingCountdownWidget} from './widgets/halvingCountdownWidget';
import {InflationRateWidget} from './widgets/inflationRateWidget';
import InfoIcon from '@mui/icons-material/Info';
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

  const [showInfoIcons, setShowInfoIcons] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const pricePromise = getBitcoinPrice()
        .then((pricePerCoin) => setPricePerCoin(pricePerCoin))
        .catch(() => setPricePerCoin(null));

      const blockHeightPromise = getBitcoinBlockHeight()
        .then((blockHeight) => setBlockHeight(blockHeight))
        .catch(() => setBlockHeight(null));

      return Promise.all([pricePromise, blockHeightPromise]);
    };

    // Initial load.
    loadData();

    // Re-load periodically.
    const intervalId = setInterval(loadData, 30000);

    // Stop re-loading on component dismount.
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

  const difficultyAdjustmentCountdownWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return <DifficultyAdjustmentCountdownWidget blockHeight={blockHeight}/>;
    }
  })();

  const stockToFlowWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return (
        <StockToFlowWidget
          blockHeight={blockHeight}
          showInfoIcon={showInfoIcons}
        />
      );
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

  const goldParityWidget = (() => {
    if (blockHeight === null) {
      return <ErrorWidget/>;
    } else if (blockHeight === undefined) {
      return <LoadingWidget/>;
    } else {
      return (
        <GoldSupplyParityWidget
          blockHeight={blockHeight}
          showInfoIcon={showInfoIcons}
        />
      );
    }
  })();

  const widgets = [
    totalSupplyPieChartWidget,
    priceWidget,
    halvingCountdownWidget,
    difficultyAdjustmentCountdownWidget,
    stockToFlowWidget,
    blockHeightWidget,
    satsPerDollarWidget,
    marketCapWidget,
    inflationRateWidget,
    goldParityWidget
  ];

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
      <SpeedDial
        ariaLabel={'SpeedDial'}
        sx={{position: 'fixed', bottom: 16, right: 16}}
        icon={<SpeedDialIcon/>}
      >
        <SpeedDialAction
          icon={<InfoIcon/>}
          tooltipTitle={'Show/Hide info icons'}
          onClick={() => setShowInfoIcons(!showInfoIcons)}
        />
      </SpeedDial>
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