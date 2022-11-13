import {formatNumber} from './helper';

export class BitcoinAmount {
  private static satsPerCoin = 100000000;

  private sats: number = 0;

  constructor(initValue?: {coins?: number, sats?: number}) {
    if (initValue) {
      this.addRaw(initValue);
    }
  }

  addRaw({coins, sats}: {coins?: number, sats?: number}) {
    const nonIntegerCoinAmount = coins && Math.floor(coins) !== coins;
    const nonIntegerSatAmount = sats && Math.floor(sats) !== sats;

    if (nonIntegerCoinAmount || nonIntegerSatAmount) {
      throw Error('Coin and sat values must be integers!');
    }

    if (coins) {
      this.sats += coins * BitcoinAmount.satsPerCoin;
    }

    if (sats) {
      this.sats += sats;
    }
  }

  public add(other: BitcoinAmount): BitcoinAmount {
    return new BitcoinAmount({sats: this.sats + other.sats});
  }

  public subtract(other: BitcoinAmount): BitcoinAmount {
    return new BitcoinAmount({sats: this.sats - other.sats});
  }

  public multiply(multiplier: number): BitcoinAmount {
    return new BitcoinAmount({sats: this.sats * multiplier});
  }

  public floorDivide(divisor: number): BitcoinAmount {
    return new BitcoinAmount({sats: Math.floor(this.sats / divisor)});
  }

  public getRatio(other: BitcoinAmount): number {
    return this.sats / other.sats;
  }

  public getTotalSatAmount(): number {
    return this.sats;
  }

  public getTotalCoinAmount(): number {
    return this.sats / BitcoinAmount.satsPerCoin;
  }

  public getCoinAmountString(): string {
    const coinAmount = Math.floor(this.sats / BitcoinAmount.satsPerCoin);
    const satAmount = Math.floor(this.sats % BitcoinAmount.satsPerCoin);

    let returnVal = `₿${formatNumber(coinAmount, 'fullNumberWithCommas')}`;

    if (satAmount) {
      let satAmountString = `${satAmount}`.padStart(8, '0');

      // Checks if the number of sats has at least 4 trailing zeros.
      if (satAmount % 10000 === 0) {
        while (satAmountString.endsWith('0')) {
          satAmountString =
            satAmountString.substring(0, satAmountString.length - 1);
        }
      }
      returnVal += `.${satAmountString}`;
    }

    return returnVal;
  }
}