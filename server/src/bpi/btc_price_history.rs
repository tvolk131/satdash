use super::dated_series::DatedSeries;
use chrono::{Date, TimeZone, Utc};
use serde::Deserialize;
use std::collections::HashMap;

pub struct BTCPriceHistory {
    /// Fallback Bitcoin price data that's stored
    /// in the binary in case API data can't be loaded.
    csv_price_by_date: DatedSeries,
    /// Dynamically-loaded up-to-date Bitcoin price data. Used by default.
    api_loaded_price_by_date_or: Option<DatedSeries>,
}

impl BTCPriceHistory {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let mut csv_price_by_date = HashMap::new();
        let mut rdr = csv::Reader::from_reader(include_bytes!("./BTC-USD.csv") as &[u8]);
        for result in rdr.deserialize() {
            let entry: BTCPriceCSVEntry = result?;
            csv_price_by_date.insert(
                convert_date_string_to_date(&entry.date).unwrap(),
                entry.open.parse::<f64>().unwrap(),
            );
        }

        let api_loaded_price_by_date_or = match load_api_btc_price_data().await {
            Ok(api_loaded_price_by_date) => Some(api_loaded_price_by_date),
            Err(_) => None,
        };

        Ok(Self {
            csv_price_by_date: DatedSeries::new(csv_price_by_date),
            api_loaded_price_by_date_or,
        })
    }

    /// Attempts to return API-loaded price data if available, falling
    /// back to preloaded CSV data if necessary.
    pub fn get_best_dataset(&self) -> &DatedSeries {
        match &self.api_loaded_price_by_date_or {
            Some(api_loaded_price_by_date) => api_loaded_price_by_date,
            None => &self.csv_price_by_date,
        }
    }
}

/// Converts a string in the format `yyyy-mm-dd` to a Date object.
fn convert_date_string_to_date(date_string: &str) -> Result<Date<Utc>, Box<dyn std::error::Error>> {
    let mut date_parts_iter = date_string.split('-');
    let year = date_parts_iter.next().unwrap_or_default().parse::<i32>()?;
    let month = date_parts_iter.next().unwrap_or_default().parse::<u32>()?;
    let day = date_parts_iter.next().unwrap_or_default().parse::<u32>()?;

    match Utc.ymd_opt(year, month, day) {
        chrono::offset::LocalResult::Single(date) => Ok(date),
        _ => Err(Box::from(format!(
            "Cannot parse date string: {}",
            date_string
        ))),
    }
}

#[derive(Deserialize)]
struct BTCPriceCSVEntry {
    /// Should always be in format "yyyy-mm-dd"
    date: String,
    open: String,
}

async fn load_api_btc_price_data() -> Result<DatedSeries, Box<dyn std::error::Error>> {
    let bitcoin_price_api_resp_string = reqwest::get(
        "https://api.statmuse.com/money/assets/64a686bd-2876-4636-bdf1-f83febe1dbb3/price?frequency=Day"
    ).await?.text().await?;
    let bitcoin_price_api_resp: BitcoinPriceApiResponse =
        serde_json::from_str(&bitcoin_price_api_resp_string).unwrap();
    let mut api_loaded_price_by_date = HashMap::new();
    for entry in bitcoin_price_api_resp.prices {
        api_loaded_price_by_date.insert(
            convert_date_string_to_date(&entry.timeframe.timestamp).unwrap(),
            entry.open,
        );
    }

    Ok(DatedSeries::new(api_loaded_price_by_date))
}

#[derive(Deserialize)]
struct BitcoinPriceApiResponse {
    prices: Vec<BitcoinPriceApiEntry>,
}

#[derive(Deserialize)]
struct BitcoinPriceApiEntry {
    timeframe: BitcoinPriceApiTimeframe,
    open: f64,
}

#[derive(Deserialize)]
struct BitcoinPriceApiTimeframe {
    /// Should always be in format "yyyy-mm-dd"
    timestamp: String,
}
