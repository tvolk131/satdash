import * as React from 'react';
import {
  getEstimatedWorldPopulationBillionsAtBlockHeight,
  getMinedBitcoinAmountFromBlockHeight
} from '../helper';
import {SimpleWidget} from './simpleWidget';

interface WorldPopulationWidgetProps {
  blockHeight: number,
  showInfoIcon: boolean
}

export const WorldPopulationWidget = (props: WorldPopulationWidgetProps) => {
  const coinsMined = getMinedBitcoinAmountFromBlockHeight(props.blockHeight);
  const worldPopulationBillions =
    getEstimatedWorldPopulationBillionsAtBlockHeight(props.blockHeight);
  const bitcoinPerPerson = coinsMined.floorDivide(
    worldPopulationBillions * 10 ** 9);
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
