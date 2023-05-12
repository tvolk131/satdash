import * as React from 'react';
import {
  getDurationEstimateFromBlockCount,
  pluralizeIfNotOne
} from '../helper';
import Typography from '@mui/material/Typography';
import {WaveBar} from '../waveBar';
import {Widget} from './widget';

interface DifficultyAdjustmentCountdownWidgetProps {
  blockHeight: number
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
    <Widget>
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