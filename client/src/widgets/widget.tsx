import * as React from 'react';
import {CSSProperties, useEffect, useState} from 'react';
import {IconButton, Paper, Typography} from '@mui/material';
import {InfoOutlined, UndoOutlined} from '@mui/icons-material';
import {ReactNode} from 'react';

interface WidgetProps {
  children?: ReactNode | ReactNode[],
  backSideInfo?: {
    description: string,
    showInfoIcon: boolean
  }
}

export const Widget = (props: WidgetProps) => {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if ((!props.backSideInfo?.showInfoIcon) && showBack) {
      setShowBack(false);
    }
  }, [props.backSideInfo?.showInfoIcon, showBack]);

  const innerSideStyles: CSSProperties = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden'
  };

  const iconButtonStyles: CSSProperties = {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1000
  };

  return (
    <div style={{padding: '10px'}}>
      <div
        style={{
          height: '400px',
          width: '400px',
          perspective: '1000px'
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            textAlign: 'center',
            transition: 'transform 0.8s',
            transformStyle: 'preserve-3d',
            transform: showBack ? 'rotateY(180deg)' : ''
          }}
        >
          <div
            style={innerSideStyles}
          >
            {
              props.backSideInfo &&
                <IconButton
                  style={{
                    ...iconButtonStyles,
                    transition: 'transform 0.5s, opacity 0.5s',
                    transform: props.backSideInfo.showInfoIcon ?
                      undefined : 'rotate(180deg)',
                    opacity: props.backSideInfo.showInfoIcon ?
                      undefined : 0,
                    cursor: props.backSideInfo.showInfoIcon ?
                      undefined : 'auto'
                  }}
                  onClick={() => {
                    props.backSideInfo?.showInfoIcon && setShowBack(!showBack);
                  }}
                >
                  <InfoOutlined
                    color={'info'}
                    style={{
                      height: '30px',
                      width: '30px'
                    }}
                  />
                </IconButton>
            }
            <Paper style={{height: '400px', width: '400px'}}>
              {props.children}
            </Paper>
          </div>
          <div
            style={{
              ...innerSideStyles,
              transform: 'rotateY(180deg)'
            }}
          >
            {
              props.backSideInfo &&
                <IconButton
                  style={iconButtonStyles}
                  onClick={() => setShowBack(!showBack)}
                >
                  <UndoOutlined
                    color={'info'}
                    style={{
                      height: '30px',
                      width: '30px'
                    }}
                  />
                </IconButton>
            }
            <Paper style={{height: '400px', width: '400px'}}>
              <Typography
                style={{
                  padding: '20px',
                  transform: 'translate(0, -50%)',
                  top: '50%',
                  position: 'absolute'
                }}
              >
                {props.backSideInfo?.description || ''}
              </Typography>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  );
};