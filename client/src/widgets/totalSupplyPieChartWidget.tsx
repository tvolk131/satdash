import * as React from 'react';
import {Paper, Typography} from '@mui/material';
import {
  formatNumber,
  getMinedBitcoinAmountFromBlockHeight,
  truncateNumber
} from '../helper';
import {PieChart} from 'react-minimal-pie-chart';

const totalBitcoin = 21000000;

interface TotalSupplyPieChartWidgetProps {
  blockHeight: number
}

export const TotalSupplyPieChartWidget =
(props: TotalSupplyPieChartWidgetProps) => {
  const minedBitcoin = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);
  const unminedBitcoin = totalBitcoin - minedBitcoin;

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px', position: 'relative'}}>
        <Typography
          variant={'h5'}
          style={{
            position: 'absolute',
            padding: '24px 0',
            justifyContent: 'center',
            display: 'flex',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {truncateNumber(minedBitcoin / totalBitcoin * 100, 4)}% of coins mined
        </Typography>
        <PieChart
          data={[
            {title: 'Mined', value: minedBitcoin, color: '#F7931A'},
            {title: 'Unmined', value: unminedBitcoin, color: '#4D4D4E'}
          ]}
          radius={30}
        />
        <svg
          viewBox={'60.204 71.486 181.279 239.955'}
          style={{
            position: 'absolute',
            transform: 'scale(0.285)',
            left: '-8px',
            top: '-72px'
          }}
        >
          <path
            fill={'#FFF'}
            d={
              'M 46.103 27.444 C 46.74 23.186 43.498 20.897 39.065 19.37 L ' +
              '40.503 13.602 L 36.992 12.727 L 35.592 18.343 C 34.669 18.113 ' +
              '33.721 17.896 32.779 17.681 L 34.189 12.028 L 30.68 11.153 L ' +
              '29.241 16.919 C 28.477 16.745 27.727 16.573 26.999 16.392 L ' +
              '27.003 16.374 L 22.161 15.165 L 21.227 18.915 C 21.227 18.915 ' +
              '23.832 19.512 23.777 19.549 C 25.199 19.904 25.456 20.845 ' +
              '25.413 21.591 L 21.473 37.392 C 21.299 37.824 20.858 38.472 ' +
              '19.864 38.226 C 19.899 38.277 17.312 37.589 17.312 37.589 L ' +
              '15.569 41.608 L 20.138 42.747 C 20.988 42.96 21.821 43.183 ' +
              '22.641 43.393 L 21.188 49.227 L 24.695 50.102 L 26.134 44.33 ' +
              'C 27.092 44.59 28.022 44.83 28.932 45.056 L 27.498 50.801 L ' +
              '31.009 51.676 L 32.462 45.853 C 38.449 46.986 42.951 46.529 ' +
              '44.846 41.114 C 46.373 36.754 44.77 34.239 41.62 32.599 C ' +
              '43.914 32.07 45.642 30.561 46.103 27.444 Z M 38.081 38.693 C ' +
              '36.996 43.053 29.655 40.696 27.275 40.105 L 29.203 32.376 C ' +
              '31.583 32.97 39.215 34.146 38.081 38.693 Z M 39.167 27.381 C ' +
              '38.177 31.347 32.067 29.332 30.085 28.838 L 31.833 21.828 C ' +
              '33.815 22.322 40.198 23.244 39.167 27.381 Z'
            }
            transform={'matrix(5.92144, 0, 0, 5.92144, -31.98701, 5.444323)'}
          />
        </svg>
        <Typography
          variant={'h5'}
          style={{
            position: 'absolute',
            padding: '24px 0',
            justifyContent: 'center',
            display: 'flex',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          {formatNumber(
            totalBitcoin - minedBitcoin,
            'fullNumberWithCommas'
          )} coins left to mine
        </Typography>
      </Paper>
    </div>
  );
};