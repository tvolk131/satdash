import * as React from 'react';
import {Paper, useTheme} from '@mui/material';
import Wave from 'react-wavify';

interface WaveBarProps {
  /** Maximum number of wave points to display on progress bar.
   * The progress bar will be divided up into this many sections
   * and the number of wave points will be set to 1 for the first
   * section and increment by 1 for each section. For example, if
   * this is set to 5 then the bar will be split into 5
   * 20%-increment chunks.
   *
   * This is needed because if we simply hardcoded the number of
   * wavepoints, then we'd either have lots of thin waves for low
   * percentages, or very few and wide waves at high percentages.
   * This allows for roughly constant-width waves regardless of
   * total filled bar width. */
  maxWavePoints?: number
  progressPercentage: number
  heightPx: number
}

export const WaveBar = (props: WaveBarProps) => {
  const theme = useTheme();

  const maxWavePoints = props.maxWavePoints || 5;

  return (
    <div
      style={{
        position: 'relative',
        height: `${props.heightPx}px`,
        margin: '0 20px'
      }}
    >
      <Paper
        style={{
          position: 'absolute',
          height: `${props.heightPx}px`,
          width: '100%'
        }}
        elevation={5}
      />
      <Paper
        style={{
          position: 'absolute',
          height: `${props.heightPx}px`,
          width: `${props.progressPercentage}%`,
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
              props.progressPercentage / (100 / maxWavePoints)
            )
          }}
        />
      </Paper>
    </div>
  );
};