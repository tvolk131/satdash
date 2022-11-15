import * as React from 'react';
import {CSSProperties, useState} from 'react';
import {IconButton, Paper, Typography} from '@mui/material';
import {InfoOutlined, UndoOutlined} from '@mui/icons-material';
import {ReactNode} from 'react';

interface WidgetProps {
  children?: ReactNode | ReactNode[],
  description?: string
}

export const Widget = (props: WidgetProps) => {
  const [showBack, setShowBack] = useState(false);

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
              props.description &&
                <IconButton
                  style={iconButtonStyles}
                  onClick={() => setShowBack(!showBack)}
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
              props.description &&
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
                {props.description}
              </Typography>
            </Paper>
          </div>
        </div>
      </div>
    </div>
  );
};