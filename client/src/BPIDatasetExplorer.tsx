import {Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Switch, Typography} from '@mui/material';
import * as React from 'react';
import {useState, useEffect} from 'react';
import {getBPIItemData, getBPIDatasets, getBPIAreas, getBPIItems, BPISeriesEntry, BPISeriesRange, BPIArea, BPIItem} from './api';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  Title,
  Legend
} from '@devexpress/dx-react-chart-material-ui';
import {scaleLog} from 'd3-scale';
import {Animation, ValueScale} from '@devexpress/dx-react-chart';

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
  validItemCodes = validItemCodes.filter((itemCode) => !deadItemCodes.has(itemCode));

  let validAreaCodes = (areas || []).map((area) => area.areaCode);
  if (selectedItemCode !== undefined) {
    validAreaCodes = datasets
      .filter((dataset) => dataset.itemCode === selectedItemCode)
      .map((dataset) => dataset.areaCode);
  }
  validAreaCodes = validAreaCodes.filter((areaCode) => !deadAreaCodes.has(areaCode));

  return [
    (areas || []).filter((area) => validAreaCodes.includes(area.areaCode)),
    (items || []).filter((item) => validItemCodes.includes(item.itemCode))
  ];
};

const numberToMonth = (num: number): string => {
  if (num === 1) {
    return 'Jan';
  } else if (num === 2) {
    return 'Feb';
  } else if (num === 3) {
    return 'Mar';
  } else if (num === 4) {
    return 'Apr';
  } else if (num === 5) {
    return 'May';
  } else if (num === 6) {
    return 'Jun';
  } else if (num === 7) {
    return 'Jul';
  } else if (num === 8) {
    return 'Aug';
  } else if (num === 9) {
    return 'Sep';
  } else if (num === 10) {
    return 'Oct';
  } else if (num === 11) {
    return 'Nov';
  } else if (num === 12) {
    return 'Dec';
  } else {
    return 'Unknown';
  }
};

export const BPIDatasetExplorer = () => {
  const [datasets, setDatasets] = useState<BPISeriesRange[] | null | undefined>(undefined);
  const [areas, setAreas] = useState<BPIArea[] | null | undefined>(undefined);
  const [items, setItems] = useState<BPIItem[] | null | undefined>(undefined);

  const [selectedAreaCode, setSelectedAreaCode] = useState<string | undefined>(undefined);
  const [selectedItemCode, setSelectedItemCode] = useState<string | undefined>(undefined);

  const [currentData, setCurrentData] = useState<BPISeriesEntry[] | null | undefined>(undefined);
  const [loadingCurrentData, setLoadingCurrentData] = useState<boolean>(false);

  const [displayInLogScale, setDisplayInLogScale] = useState<boolean>(false);

  const [[validAreas, validItems], setValidAreasAndItems] = useState<[BPIArea[], BPIItem[]]>([[], []]);

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

      // TODO - Use an observable instead of a promise here to prevent
      // wonky behavior where an earlier promise finishes after a later one.
      getBPIItemData(selectedItemCode, selectedAreaCode)
        .then((data) => setCurrentData(data))
        .catch(() => setCurrentData(null))
        .finally(() => setLoadingCurrentData(false));
    }
  }, [selectedAreaCode, selectedItemCode]);

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
    <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
  );
  const Label = (props: any) => (
    <Legend.Label sx={{ pt: 1, whiteSpace: 'nowrap' }} {...props} />
  );
  const Item = (props: any) => (
    <Legend.Item sx={{ flexDirection: 'column' }} {...props} />
  );
  const TitleText = (props: any) => (
    <Title.Text {...props} sx={{ whiteSpace: 'pre' }} />
  );

  const chartHeightPx = 500;
  const chartLoadingSpinnerSize = 100;

  return (
    <div>
      <Paper style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px'}}>
        <Button
          disabled={selectedAreaCode === undefined && selectedItemCode === undefined}
          onClick={() => {
            setSelectedAreaCode(undefined);
            setSelectedItemCode(undefined);
          }}
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
            value={areas?.find((area) => area.areaCode === selectedAreaCode)?.areaCode || ''}
            onChange={(e) => setSelectedAreaCode(e.target.value)}
          >
            {
              validAreas.map((area) => (
                <MenuItem value={area.areaCode}>{area.areaName}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
        <div style={{margin: '0 20px'}}>
          <Typography>Log Scale</Typography>
          <Switch
            checked={displayInLogScale}
            onChange={() => setDisplayInLogScale(!displayInLogScale)}
          />
        </div>
        <FormControl sx={{m: 1, minWidth: 120}} size={'small'}>
          <InputLabel id={'bpi-item-select-helper-label'}>Item</InputLabel>
          <Select
            disabled={!items}
            label={'Item'}
            labelId={'bpi-item-select-helper-label'}
            id={'bpi-item-select-helper-label'}
            value={items?.find((item) => item.itemCode === selectedItemCode)?.itemCode || ''}
            onChange={(e) => setSelectedItemCode(e.target.value)}
          >
            {
              validItems.map((item) => (
                <MenuItem value={item.itemCode}>{item.itemName}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </Paper>
      <Paper>
        {
          currentData &&
            <Chart
              data={(currentData || []).map((data) => ({
                ...data,
                totalMonths: (data.year * 12) + data.month
              }))}
            >
              <ArgumentAxis tickFormat={() => (tick) => {
                const totalMonths = parseInt(tick, 10);
                let month = totalMonths % 12;
                if (month === 0) {
                  month = 12;
                }
                const year = (totalMonths - month) / 12;

                return `${numberToMonth(month)} ${year}`;
              }} />
              {
                displayInLogScale &&
                  <ValueScale
                    factory={() => scaleLog().base(2)} modifyDomain={(domain) => [Math.min(domain[0], 64), domain[1]]}
                  />
              }
              <ValueAxis
                labelComponent={(props) => (
                  <ValueAxis.Label
                    {...props}
                    text={`${props.text} sats`}
                  />
                )}
              />
              <LineSeries
                name={items?.find((item) => item.itemCode === selectedItemCode)?.itemName}
                valueField='valueSats'
                argumentField='totalMonths'
              />
              <Legend position='bottom' rootComponent={Root} itemComponent={Item} labelComponent={Label} />
              <Title
                text={`${items?.find((item) => item.itemCode === selectedItemCode)?.itemName} in ${areas?.find((area) => area.areaCode === selectedAreaCode)?.areaName}`}
                textComponent={TitleText}
              />
              <Animation />
            </Chart>
        }
        {
          currentData === undefined &&
            <div style={{height: `${chartHeightPx}px`, textAlign: 'center'}}>
              {loadingCurrentData && <CircularProgress size={chartLoadingSpinnerSize} style={{padding: `${(chartHeightPx / 2) - chartLoadingSpinnerSize}px`}}/>}
            </div>
        }
      </Paper>
    </div>
  );
};