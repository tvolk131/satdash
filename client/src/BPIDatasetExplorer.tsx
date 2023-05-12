import * as React from 'react';
import {Animation, ValueScale} from '@devexpress/dx-react-chart';
import {
  ArgumentAxis,
  Chart,
  Legend,
  LineSeries,
  Title,
  ValueAxis,
  ZoomAndPan
} from '@devexpress/dx-react-chart-material-ui';
import {
  BPIArea,
  BPIItem,
  BPISeriesEntry,
  BPISeriesRange,
  getBPIAreas,
  getBPIDatasets,
  getBPIItemData,
  getBPIItems
} from './api';
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import UndoIcon from '@mui/icons-material/Undo';
import {scaleLog} from 'd3-scale';
import {useTheme} from '@mui/material/styles';

const getValidAreasAndItemsBasedOnDatasets = (
  datasets: BPISeriesRange[] | null | undefined,
  items: BPIItem[] | null | undefined,
  areas: BPIArea[] | null | undefined,
  selectedItemCode?: string,
  selectedAreaCode?: string
): [BPIArea[], BPIItem[]] => {
  if (!datasets) {
    return [[], []];
  }

  const deadItemCodes = new Set(items?.map((item) => item.itemCode) || []);
  const deadAreaCodes = new Set(areas?.map((area) => area.areaCode) || []);
  datasets.forEach((dataset) => {
    deadItemCodes.delete(dataset.itemCode);
    deadAreaCodes.delete(dataset.areaCode);
  });

  let validItemCodes = (items || []).map((item) => item.itemCode);
  if (selectedAreaCode !== undefined) {
    validItemCodes = datasets
      .filter((dataset) => dataset.areaCode === selectedAreaCode)
      .map((dataset) => dataset.itemCode);
  }
  validItemCodes = validItemCodes.filter(
    (itemCode) => !deadItemCodes.has(itemCode)
  );

  let validAreaCodes = (areas || []).map((area) => area.areaCode);
  if (selectedItemCode !== undefined) {
    validAreaCodes = datasets
      .filter((dataset) => dataset.itemCode === selectedItemCode)
      .map((dataset) => dataset.areaCode);
  }
  validAreaCodes = validAreaCodes.filter(
    (areaCode) => !deadAreaCodes.has(areaCode)
  );

  return [
    (areas || []).filter((area) => validAreaCodes.includes(area.areaCode)),
    (items || []).filter((item) => validItemCodes.includes(item.itemCode))
  ];
};

const numberToMonth = (num: number): string => {
  const monthNumbersToNames: {[key: number]: string} = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec'
  };

  return monthNumbersToNames[num] || 'Unknown';
};

const transformItemName =
(itemName: string | undefined): string | undefined => {
  if (itemName === undefined) {
    return undefined;
  }

  const suffixUnitReplacements = [
    [', per lb. (453.6 gm)', ' (per pound)'],
    [',per lb. (453.6 gm)', ' (per pound)'],
    [', per gallon/3.785 liters', ' (per gallon)'],
    [', per gal. (3.8 lit)', ' (per gallon)'],
    [' per gallon (3.785 liters)', ' (per gallon)'],
    [', per 8 oz. (226.8 gm)', ' (per 8 ounces)'],
    [', per 12 oz. (340.2 gm)', ' (per 12 ounces)'],
    [', per 12 oz. (354.9 ml)', ' (per 12 ounces)'],
    [', per 16 oz. (473.2 ml)', ' (per 16 ounces)'],
    [', per 16 oz.', ' (per 16 ounces)'],
    [', per 1 liter (33.8 oz)', ' (per liter)'],
    [', per 2 liters (67.6 oz)', ' (per 2 liters)'],
    [', per 1/2 gal. (1.9 lit)', ' (per 1/2 gallon)'],
    [', per doz.', ' (per dozen)'],
    [' - 40 therms', ' (per 40 therms)'],
    [' - 100 therms', ' (per 100 therms)'],
    [' per therm', ' (per therm)'],
    [' per KWH', ' (per kWh)'],
    [' per 500 KWH', ' (per 500 kWh)']
  ];

  for (const [match, replacement] of suffixUnitReplacements) {
    if (itemName.endsWith(match)) {
      return itemName.replace(match, replacement);
    }
  }

  return itemName;
};

const parseLabelPropText = (propText: string | number): number | undefined => {
  if (typeof propText === 'number') {
    return propText;
  }

  if (propText.length === 0) {
    return undefined;
  }

  propText = propText.split(',').join('');
  let num = parseInt(propText, 10);
  if (`${num}`.length < propText.length) {
    const lastChar = propText[propText.length - 1];
    if (lastChar === 'k') {
      num *= 1e3;
    } else if (lastChar === 'M') {
      num *= 1e6;
    } else if (lastChar === 'G') {
      num *= 1e9;
    } else {
      throw Error(`Unknown number multiplier character: ${lastChar}`);
    }
  }
  return num;
};

const satAmountToLabelText = (satAmount: number | undefined): string => {
  if (satAmount === undefined) {
    return '';
  }

  if (satAmount < 0) {
    return `-${satAmountToLabelText(-satAmount)}`;
  }

  if (satAmount >= 1e8) {
    return `₿${roundNumberToThreeDecimalPlaces(satAmount / 1e8)}`;
  } else if (satAmount >= 1e6) {
    return `${roundNumberToThreeDecimalPlaces(satAmount / 1e6)} Msats`;
  } else if (satAmount >= 1e3) {
    return `${roundNumberToThreeDecimalPlaces(satAmount / 1e3)} Ksats`;
  } else {
    return `${satAmount} sats`;
  }
};

const roundNumberToThreeDecimalPlaces = (num: number): number => {
  return Math.round(num * 1000) / 1000;
};

const getEpochTime = (entry: BPISeriesEntry): number => {
  return (new Date(`${entry.month}/${entry.day}/${entry.year}`)).valueOf();
};

type DisplayScale = {scale: 'linear'} | {scale: 'log', log: number};

export const BPIDatasetExplorer = () => {
  const [datasets, setDatasets] =
    useState<BPISeriesRange[] | null | undefined>(undefined);
  const [areas, setAreas] = useState<BPIArea[] | null | undefined>(undefined);
  const [items, setItems] = useState<BPIItem[] | null | undefined>(undefined);

  const [selectedAreaCode, setSelectedAreaCode] =
    useState<string | undefined>(undefined);
  const [selectedItemCode, setSelectedItemCode] =
    useState<string | undefined>(undefined);

  const [currentData, setCurrentData] =
    useState<BPISeriesEntry[] | null | undefined>(undefined);
  const [loadingCurrentData, setLoadingCurrentData] = useState<boolean>(false);

  const [
    displayScale,
    setDisplayScale
  ] = useState<DisplayScale>({scale: 'linear'});

  const [
    [validAreas, validItems],
    setValidAreasAndItems
  ] = useState<[BPIArea[], BPIItem[]]>([[], []]);

  const theme = useTheme();

  // The number of past years to show data for.
  // Undefined means we should show all data.
  const [currentDataSlice, setCurrentDataSlice] =
    useState<undefined | 1 | 5>(undefined);

  useEffect(() => {
    const datasetsPromise = getBPIDatasets()
      .then((datasets) => setDatasets(datasets))
      .catch(() => setDatasets(null));

    const areasPromise = getBPIAreas()
      .then((areas) => setAreas(areas))
      .catch(() => setAreas(null));

    const itemsPromise = getBPIItems()
      .then((items) => setItems(items))
      .catch(() => setItems(null));

    Promise.all([datasetsPromise, areasPromise, itemsPromise]);
  }, []);

  useEffect(() => {
    setCurrentData(undefined);
    if (selectedAreaCode && selectedItemCode) {
      setLoadingCurrentData(true);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let startYear: number | undefined;
      let startMonth: number | undefined;
      if (currentDataSlice) {
        startYear = currentYear - currentDataSlice;
        startMonth = currentMonth;
      }

      // TODO - Use an observable instead of a promise here to prevent
      // wonky behavior where an earlier promise finishes after a later one.
      getBPIItemData(selectedItemCode, selectedAreaCode, startYear, startMonth)
        .then((data) => setCurrentData(data))
        .catch(() => setCurrentData(null))
        .finally(() => setLoadingCurrentData(false));
    }
  }, [selectedAreaCode, selectedItemCode, currentDataSlice]);

  useEffect(() => {
    setValidAreasAndItems(getValidAreasAndItemsBasedOnDatasets(
      datasets,
      items,
      areas,
      selectedItemCode,
      selectedAreaCode
    ));
  }, [datasets, items, areas, selectedItemCode, selectedAreaCode]);

  const Root = (props: any) => (
    <Legend.Root
      sx={{display: 'flex', margin: 'auto', flexDirection: 'row'}}
      {...props}
    />
  );
  const Label = (props: any) => (
    <Legend.Label sx={{pt: 1, whiteSpace: 'nowrap'}} {...props}/>
  );
  const Item = (props: any) => (
    <Legend.Item sx={{flexDirection: 'column'}} {...props}/>
  );
  const TitleText = (props: any) => (
    <Title.Text sx={{whiteSpace: 'pre'}} {...props}/>
  );

  const chartHeightPx = 500;
  const chartLoadingSpinnerSize = 100;
  const loadingSpinnerPaddingAmt =
    (chartHeightPx / 2) - chartLoadingSpinnerSize;

  const currentItem = items?.find((item) => item.itemCode === selectedItemCode);
  const currentArea = areas?.find((area) => area.areaCode === selectedAreaCode);
  const transformedItemName = transformItemName(currentItem?.itemName);

  return (
    <div>
      <Paper style={{padding: '10px'}}>
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <Button
            variant={'contained'}
            disabled={
              selectedAreaCode === undefined &&
              selectedItemCode === undefined
            }
            onClick={() => {
              setSelectedAreaCode(undefined);
              setSelectedItemCode(undefined);
            }}
            startIcon={<UndoIcon/>}
          >
            Reset
          </Button>
          <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
            <InputLabel id={'bpi-area-select-helper-label'}>Area</InputLabel>
            <Select
              disabled={!areas}
              label={'Area'}
              labelId={'bpi-area-select-helper-label'}
              id={'bpi-area-select-helper-label'}
              value={currentArea?.areaCode || ''}
              onChange={(e) => setSelectedAreaCode(e.target.value)}
            >
              {
                validAreas.map((area, index) => (
                  <MenuItem
                    value={area.areaCode}
                    key={index}
                  >
                    {area.areaName}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
            <InputLabel id={'bpi-item-select-helper-label'}>Item</InputLabel>
            <Select
              disabled={!items}
              label={'Item'}
              labelId={'bpi-item-select-helper-label'}
              id={'bpi-item-select-helper-label'}
              value={currentItem?.itemCode || ''}
              onChange={(e) => setSelectedItemCode(e.target.value)}
            >
              {
                validItems.map((item, index) => (
                  <MenuItem value={item.itemCode} key={index}>
                    {transformItemName(item.itemName)}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <ButtonGroup variant={'contained'} style={{margin: '5px'}}>
            <Button
              onClick={() => setCurrentDataSlice(undefined)}
              disabled={currentDataSlice === undefined}
            >
              Max
            </Button>
            <Button
              onClick={() => setCurrentDataSlice(1)}
              disabled={currentDataSlice === 1}
            >
              1 Year
            </Button>
            <Button
              onClick={() => setCurrentDataSlice(5)}
              disabled={currentDataSlice === 5}
            >
              5 Years
            </Button>
          </ButtonGroup>
          <div style={{margin: '0 10px'}}>
            <ButtonGroup variant={'contained'} style={{margin: '5px'}}>
              <Button
                onClick={() => setDisplayScale({scale: 'linear'})}
                disabled={displayScale.scale === 'linear'}
              >
                Linear
              </Button>
              <Button
                onClick={() => setDisplayScale({scale: 'log', log: 2})}
                disabled={
                  displayScale.scale === 'log' && displayScale.log === 2
                }
              >
                Log (Base 2)
              </Button>
              <Button
                onClick={() => setDisplayScale({scale: 'log', log: 10})}
                disabled={
                  displayScale.scale === 'log' && displayScale.log === 10
                }
              >
                Log (Base 10)
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Paper>
      <Paper>
        {
          currentData &&
            <Chart
              data={currentData.map((data) => ({
                ...data,
                epochTime: getEpochTime(data)
              }))}
            >
              <ArgumentAxis tickFormat={() => (tick) => {
                const epochTime = parseInt(tick, 10);
                const date = new Date(epochTime);
                const [
                  month,
                  _day,
                  year
                ] = date.toLocaleDateString().split('/');

                return `${numberToMonth(parseInt(month, 10))} ${year}`;
              }} />
              {
                displayScale.scale === 'log' &&
                  <ValueScale
                    factory={() => scaleLog().base(displayScale.log)}
                  />
              }
              <ValueAxis
                labelComponent={(props) => (
                  <ValueAxis.Label
                    {...props}
                    text={satAmountToLabelText(parseLabelPropText(props.text))}
                  />
                )}
              />
              <LineSeries
                name={transformedItemName}
                color={theme.palette.primary.main}
                valueField='valueSats'
                argumentField='epochTime'
              />
              <ZoomAndPan/>
              <Legend
                position='bottom'
                rootComponent={Root}
                itemComponent={Item}
                labelComponent={Label}
              />
              <Title
                text={`${transformedItemName} in ${currentArea?.areaName}`}
                textComponent={TitleText}
              />
              <Animation/>
            </Chart>
        }
        {
          currentData === undefined &&
            <div style={{height: `${chartHeightPx}px`, textAlign: 'center'}}>
              {loadingCurrentData &&
                  <CircularProgress
                    size={chartLoadingSpinnerSize}
                    style={{padding: `${loadingSpinnerPaddingAmt}px`}}
                  />
              }
            </div>
        }
      </Paper>
    </div>
  );
};