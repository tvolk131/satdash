use serde::Deserialize;
use std::collections::HashMap;

pub struct BTCPriceHistory {
    price_by_date: HashMap<(i32, i32, i32), f64>,
}

impl BTCPriceHistory {
    pub fn new_from_reader(reader: impl std::io::Read) -> Result<Self, csv::Error> {
        let mut price_by_date = HashMap::new();

        let mut rdr = csv::Reader::from_reader(reader);

        for result in rdr.deserialize() {
            let entry: BTCPriceCSVEntry = result?;
            let mut date_parts_iter = entry.date.split('-');
            let year = date_parts_iter.next().unwrap().parse::<i32>().unwrap();
            let month = date_parts_iter.next().unwrap().parse::<i32>().unwrap();
            let day = date_parts_iter.next().unwrap().parse::<i32>().unwrap();
            price_by_date.insert((year, month, day), entry.open.parse::<f64>().unwrap());
        }

        Ok(Self { price_by_date })
    }

    pub fn get_average_price_for_month(&self, year: i32, month: i32) -> Option<f64> {
        let mut price_sum = 0.0;
        let mut price_count = 0;

        for day in 1..31 {
            if let Some(price) = self.price_by_date.get(&(year, month, day)) {
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

#[derive(Debug, Deserialize)]
struct BTCPriceCSVEntry {
    date: String,
    open: String,
}
