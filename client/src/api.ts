import axios from 'axios';

export const getBitcoinPrice = async (): Promise<number> => {
  return ((await axios.get('https://api.blockchain.com/v3/exchange/tickers/BTC-USD')).data as any).last_trade_price;
};

export const getBitcoinBlockHeight = async (): Promise<number> => {
  return (await axios.get('https://blockchain.info/q/getblockcount')).data as number;
};