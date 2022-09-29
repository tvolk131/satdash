use serde::Deserialize;
use std::collections::HashMap;

pub struct BTCPriceHistory {
    entries_by_date: HashMap<String, BTCPriceCSVEntry>,
}

impl BTCPriceHistory {
    pub fn new_from_reader(reader: impl std::io::Read) -> Result<Self, csv::Error> {
        let mut entries_by_date = HashMap::new();

        let mut rdr = csv::Reader::from_reader(reader);

        for result in rdr.deserialize() {
            let entry: BTCPriceCSVEntry = result?;
            entries_by_date.insert(entry.date.clone(), entry);
        }

        Ok(Self { entries_by_date })
    }

    pub fn get_average_price_for_month(&self, year: i32, month: i32) -> Option<f64> {
        let mut price_sum = 0.0;
        let mut price_count = 0;

        let month_string = format!("{:0>2}", month);

        for day in 1..31 {
            let day_string = format!("{:0>2}", day);
            if let Some(entry) = self
                .entries_by_date
                .get(&format!("{}-{}-{}", year, month_string, day_string))
            {
                price_sum += entry.open.parse::<f64>().unwrap();
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
