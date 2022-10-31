import axios from 'axios';

export const getBitcoinPrice = async (): Promise<number> => {
  const res = await axios.get(
    'https://api.blockchain.com/v3/exchange/tickers/BTC-USD');
  return res.data.last_trade_price;
};

export const getBitcoinBlockHeight = async (): Promise<number> => {
  const res = await axios.get('https://blockchain.info/q/getblockcount');
  return res.data as number;
};

export const getBPIItemData = async (
  itemCode: string,
  areaCode?: string,
  startYear?: number,
  startMonth?: number,
  endYear?: number,
  endMonth?: number
): Promise<BPISeriesEntry[]> => {
  return (await axios.get('/api/bpi/item', {params: {
    item_code: itemCode,
    area_code: areaCode,
    start_year: startYear,
    start_month: startMonth,
    end_year: endYear,
    end_month: endMonth
  }})).data;
};

export interface BPISeriesEntry {
  year: number;
  month: number;
  day: number;
  valueSats: number;
}

export const getBPIDatasets = async (): Promise<BPISeriesRange[]> => {
  return (await axios.get('/api/bpi/datasets')).data;
};

export interface BPISeriesRange {
  itemCode: string;
  areaCode: string;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export const getBPIAreas = async (): Promise<BPIArea[]> => {
  return (await axios.get('/api/bpi/areas')).data;
};

export interface BPIArea {
  areaCode: string;
  areaName: string;
}

export const getBPIItems = async (): Promise<BPIItem[]> => {
  return (await axios.get('/api/bpi/items')).data;
};

export interface BPIItem {
  itemCode: string;
  itemName: string;
}