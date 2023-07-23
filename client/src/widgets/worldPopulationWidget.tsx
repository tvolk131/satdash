import * as React from 'react';
import {SimpleWidget} from './simpleWidget';
import {getMinedBitcoinAmountFromBlockHeight} from '../helper';

interface WorldPopulationWidgetProps {
  blockHeight: number,
  showInfoIcon: boolean
}

export const WorldPopulationWidget = (props: WorldPopulationWidgetProps) => {
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);
  // TODO - Pull this value from an API or use the block height to calculate
  // an estimate.
  const worldPopulation = 7.888 * 10 ** 9;
  const bitcoinPerPerson = coinsMined.floorDivide(worldPopulation);
  bitcoinPerPerson.getCoinAmountString();

  return (
    <SimpleWidget
      backSideInfo={{
        description: 'The number of Bitcoin mined divided by the world ' +
        'population.',
        showInfoIcon: props.showInfoIcon
      }}
      headerText={'Sats per Person'}
      mainText={`${bitcoinPerPerson.getTotalSatAmount()}`}
    />
  );
};
