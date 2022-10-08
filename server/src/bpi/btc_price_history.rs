use serde::Deserialize;
use std::collections::HashMap;

pub struct BTCPriceHistory {
    /// Fallback Bitcoin price data that's stored
    /// in the binary in case API data can't be loaded.
    csv_price_by_date: HashMap<(i32, u32, i32), f64>,
    /// Dynamically-loaded up-to-date Bitcoin price data. Used by default.
    api_loaded_price_by_date_or: Option<HashMap<(i32, u32, i32), f64>>,
}

impl BTCPriceHistory {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let mut csv_price_by_date = HashMap::new();
        let mut rdr = csv::Reader::from_reader(include_bytes!("./BTC-USD.csv") as &[u8]);
        for result in rdr.deserialize() {
            let entry: BTCPriceCSVEntry = result?;
            csv_price_by_date.insert(
                convert_date_string_to_number_tuple(&entry.date).unwrap(),
                entry.open.parse::<f64>().unwrap(),
            );
        }

        let api_loaded_price_by_date_or = match load_api_btc_price_data().await {
            Ok(api_loaded_price_by_date) => Some(api_loaded_price_by_date),
            Err(_) => None,
        };

        Ok(Self {
            csv_price_by_date,
            api_loaded_price_by_date_or,
        })
    }

    /// Attempts to return API-loaded price data if available, falling
    /// back to preloaded CSV data if necessary.
    fn get_best_dataset(&self) -> &HashMap<(i32, u32, i32), f64> {
        match &self.api_loaded_price_by_date_or {
            Some(api_loaded_price_by_date) => api_loaded_price_by_date,
            None => &self.csv_price_by_date,
        }
    }

    pub fn get_average_price_for_month(&self, year: i32, month: u32) -> Option<f64> {
        let mut price_sum = 0.0;
        let mut price_count = 0;

        let best_dataset = self.get_best_dataset();

        for day in 1..31 {
            if let Some(price) = best_dataset.get(&(year, month, day)) {
                price_sum += price;
                price_count += 1;
            }
        }

        if price_count == 0 {
            return None;
        }

        Some(price_sum / price_count as f64)
    }
}

/// Converts a string in the format `yyyy-mm-dd` to a tuple of three numbers in the format `(year, month, day)`.
fn convert_date_string_to_number_tuple(
    date_string: &str,
) -> Result<(i32, u32, i32), Box<dyn std::error::Error>> {
    let mut date_parts_iter = date_string.split('-');
    let year = date_parts_iter.next().unwrap_or_default().parse::<i32>()?;
    let month = date_parts_iter.next().unwrap_or_default().parse::<u32>()?;
    let day = date_parts_iter.next().unwrap_or_default().parse::<i32>()?;

    Ok((year, month, day))
}

#[derive(Deserialize)]
struct BTCPriceCSVEntry {
    /// Should always be in format "yyyy-mm-dd"
    date: String,
    open: String,
}

async fn load_api_btc_price_data(
) -> Result<HashMap<(i32, u32, i32), f64>, Box<dyn std::error::Error>> {
    let bitcoin_price_api_resp_string = reqwest::get(
        "https://api.statmuse.com/money/assets/64a686bd-2876-4636-bdf1-f83febe1dbb3/price?frequency=Day"
    ).await?.text().await?;
    let bitcoin_price_api_resp: BitcoinPriceApiResponse =
        serde_json::from_str(&bitcoin_price_api_resp_string).unwrap();
    let mut api_loaded_price_by_date = HashMap::new();
    for entry in bitcoin_price_api_resp.prices {
        api_loaded_price_by_date.insert(
            convert_date_string_to_number_tuple(&entry.timeframe.timestamp).unwrap(),
            entry.open,
        );
    }

    Ok(api_loaded_price_by_date)
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
