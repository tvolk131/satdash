import * as React from 'react';
import {
  getDurationEstimateFromBlockCount,
  getNextHalvingData,
  maxBlockHeightWithReward,
  pluralizeIfNotOne
} from '../helper';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import {Typography} from '@mui/material';
import {WaveBar} from '../waveBar';
import {Widget} from './widget';

interface HalvingCountdownWidgetProps {
  blockHeight: number
}

export const HalvingCountdownWidget = (props: HalvingCountdownWidgetProps) => {
  const nextHalvingData = getNextHalvingData(props.blockHeight);
  const blocksUntilHalving = nextHalvingData.blockHeight - props.blockHeight;
  const halvingProgressPercentage = 100 - (blocksUntilHalving / 210000 * 100);
  const halvingDuration = getDurationEstimateFromBlockCount(blocksUntilHalving);

  if (props.blockHeight > maxBlockHeightWithReward) {
    const greenCheckWidthPx = 100;

    return (
      <Widget>
        <div style={{padding: '119px 0'}}>
          <Typography
            variant={'h4'}
            style={{textAlign: 'center', paddingBottom: '20px'}}
          >
            All Bitcoin is mined!
          </Typography>
          <div style={{textAlign: 'center'}}>
            <CheckCircleIcon
              color={'success'}
              style={{
                height: `${greenCheckWidthPx}px`,
                width: `${greenCheckWidthPx}px`
              }}
            />
          </div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget>
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
          {pluralizeIfNotOne(blocksUntilHalving, 'block')}
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
        <WaveBar
          progressPercentage={halvingProgressPercentage}
          heightPx={55}
        />
      </div>
    </Widget>
  );
};