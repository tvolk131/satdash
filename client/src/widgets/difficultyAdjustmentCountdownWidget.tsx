import * as React from 'react';
import {
  getDurationEstimateFromBlockCount,
  pluralizeIfNotOne
} from '../helper';
import Typography from '@mui/material/Typography';
import {WaveBar} from '../waveBar';
import {Widget} from './widget';

interface DifficultyAdjustmentCountdownWidgetProps {
  blockHeight: number,
  showInfoIcon: boolean
}

const blocksPerDifficultyAdjustment = 2016;

export const DifficultyAdjustmentCountdownWidget =
(props: DifficultyAdjustmentCountdownWidgetProps) => {
  const blocksUntilDifficultyAdjustment = (
    blocksPerDifficultyAdjustment
    - (props.blockHeight % blocksPerDifficultyAdjustment)
  );
  const difficultyAdjustmentProgressPercentage = (
    (blocksPerDifficultyAdjustment - blocksUntilDifficultyAdjustment)
    / blocksPerDifficultyAdjustment * 100
  );
  const difficultyAdjustmentDuration =
    getDurationEstimateFromBlockCount(blocksUntilDifficultyAdjustment);

  return (
    <Widget
      backSideInfo={{
        description: 'The difficulty adjustment is a mechanism that keeps ' +
        'the average block time at 10 minutes. Every 2016 blocks ' +
        '(approximately every two weeks) the average block time is ' +
        'calculated. If the average block time over the most recent 2016 ' +
        'blocks was less than 10 minutes, the difficulty increases. If it ' +
        'was more than 10 minutes, the difficulty decreases.',
        showInfoIcon: props.showInfoIcon
      }}
    >
      <div style={{padding: '57px 0'}}>
        <Typography
          variant={'h4'}
          style={{padding: '0 10px 10px 10px', textAlign: 'center'}}
        >
          Next Difficulty Adjustment
        </Typography>
        <Typography
          variant={'h2'}
          style={{padding: '10px', textAlign: 'center'}}
        >
          {pluralizeIfNotOne(blocksUntilDifficultyAdjustment, 'block')}
        </Typography>
        <Typography style={{padding: '10px', textAlign: 'center'}}>
          Approximately {difficultyAdjustmentDuration}
        </Typography>
        <WaveBar
          progressPercentage={difficultyAdjustmentProgressPercentage}
          heightPx={55}
        />
      </div>
    </Widget>
  );
};