import * as React from 'react';
import {Paper, Typography, useTheme} from '@mui/material';
import {
  getDurationEstimateFromBlockCount,
  getNextHalvingData,
  maxBlockHeightWithReward
} from '../helper';
import {CheckCircleOutline} from '@mui/icons-material';
import Wave from 'react-wavify';

interface HalvingCountdownWidgetProps {
  blockHeight: number
}

export const HalvingCountdownWidget = (props: HalvingCountdownWidgetProps) => {
  const nextHalvingData = getNextHalvingData(props.blockHeight);
  const blocksUntilHalving = nextHalvingData.blockHeight - props.blockHeight;
  const halvingProgressPercentage = 100 - (blocksUntilHalving / 210000 * 100);
  const halvingDuration = getDurationEstimateFromBlockCount(blocksUntilHalving);
  const progressBarHeightPx = 55;

  // Maximum number of wave points to display on progress bar.
  // The progress bar will be divided up into this many sections
  // and the number of wave points will be set to 1 for the first
  // section and increment by 1 for each section. For example, if
  // this is set to 5 then the bar will be split into 5
  // 20%-increment chunks.
  //
  // This is needed because if we simply hardcoded the number of
  // wavepoints, then we'd either have lots of thin waves for low
  // percentages, or very few and wide waves at high percentages.
  // This allows for roughly constant-width waves regardless of
  // total filled bar width.
  const maxWavePoints = 5;

  const theme = useTheme();

  if (props.blockHeight > maxBlockHeightWithReward) {
    const greenCheckWidthPx = 100;

    return (
      <div style={{padding: '10px'}}>
        <Paper style={{height: '400px', width: '400px'}}>
          <div style={{padding: '119px 0'}}>
            <Typography
              variant={'h4'}
              style={{textAlign: 'center', paddingBottom: '20px'}}
            >
              All Bitcoin is mined!
            </Typography>
            <div style={{textAlign: 'center'}}>
              <CheckCircleOutline
                color={'success'}
                style={{
                  height: `${greenCheckWidthPx}px`,
                  width: `${greenCheckWidthPx}px`
                }}
              />
            </div>
          </div>
        </Paper>
      </div>
    );
  }

  return (
    <div style={{padding: '10px'}}>
      <Paper style={{height: '400px', width: '400px'}}>
        <div style={{padding: '53px 0'}}>
          <Typography
            variant={'h4'}
            style={{padding: '0 10px 10px 10px', textAlign: 'center'}}
          >
            Next Halving
          </Typography>
          <Typography
            variant={'h2'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            {blocksUntilHalving} block{blocksUntilHalving > 1 && 's'}
          </Typography>
          <Typography style={{padding: '10px', textAlign: 'center'}}>
            Approximately {halvingDuration}
          </Typography>
          <Typography
            variant={'h6'}
            style={{padding: '10px', textAlign: 'center'}}
          >
            Block reward will be {
              nextHalvingData.blockReward.getTotalSatAmount() > 0 ?
                `reduced to ${
                  nextHalvingData.blockReward.getCoinAmountString()
                }`
                :
                'removed'
            }
          </Typography>
          <div
            style={{
              position: 'relative',
              height: `${progressBarHeightPx}px`,
              margin: '0 20px'
            }}
          >
            <Paper
              style={{
                position: 'absolute',
                height: `${progressBarHeightPx}px`,
                width: '100%'
              }}
              elevation={5}
            />
            <Paper
              style={{
                position: 'absolute',
                height: `${progressBarHeightPx}px`,
                width: `${halvingProgressPercentage}%`,
                backgroundColor: theme.palette.primary.dark,
                overflow: 'hidden'
              }}
            >
              <Wave
                fill={theme.palette.primary.main}
                paused={false}
                options={{
                  amplitude: 10,
                  points: Math.ceil(
                    halvingProgressPercentage / (100 / maxWavePoints)
                  )
                }}
              />
            </Paper>
          </div>
        </div>
      </Paper>
    </div>
  );
};