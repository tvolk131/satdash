mod btc_csv;
mod cpi_ap;
mod cpi_query_engine;

use cpi_ap::{Area, Item, SeriesEntry};
pub use cpi_ap::{AreaCode, ItemCode};
use serde::Serialize;

pub struct BPIEngine {
    cpi_query_engine: cpi_query_engine::CpiQueryEngine,
    btc_price_history: btc_csv::BTCPriceHistory,
}

impl BPIEngine {
    pub async fn new() -> Self {
        Self {
            cpi_query_engine: cpi_query_engine::CpiQueryEngine::new().await,
            btc_price_history: btc_csv::BTCPriceHistory::new_from_reader(
                std::fs::File::open("./BTC-USD.csv").unwrap(),
            )
            .unwrap(),
        }
    }

    pub fn get_areas(&self) -> &Vec<Area> {
        self.cpi_query_engine.get_areas()
    }

    pub fn get_items(&self) -> &Vec<Item> {
        self.cpi_query_engine.get_items()
    }

    pub fn get_series_data(
        &self,
        item_code: &ItemCode,
        area_code_or: Option<&AreaCode>,
        start_year_or: Option<i32>,
        end_year_or: Option<i32>,
    ) -> Vec<BPISeriesEntry> {
        self.cpi_query_engine
            .get_series_data(item_code, area_code_or, start_year_or, end_year_or)
            .iter()
            .filter_map(|entry| self.cpi_entry_to_bpi_entry(entry))
            .collect()
    }

    pub fn get_valid_series_ranges(&self) -> Vec<BPISeriesRange> {
        let mut series_ranges = Vec::new();

        for item in self.get_items() {
            for area in self.get_areas() {
                let series_entries = self.get_series_data(
                    item.get_item_code(),
                    Some(area.get_area_code()),
                    None,
                    None,
                );
                if let Some(first_entry) = series_entries.first() {
                    if let Some(last_entry) = series_entries.last() {
                        series_ranges.push(BPISeriesRange {
                            item_code: item.get_item_code().clone(),
                            area_code: area.get_area_code().clone(),
                            start_year: first_entry.year,
                            start_month: first_entry.month,
                            end_year: last_entry.year,
                            end_month: last_entry.month,
                        });
                    }
                }
            }
        }

        series_ranges
    }

    fn cpi_entry_to_bpi_entry(&self, cpi_entry: &SeriesEntry) -> Option<BPISeriesEntry> {
        let year = cpi_entry.get_year();
        let month = cpi_entry.get_month();

        Some(BPISeriesEntry {
            series_id: String::from(cpi_entry.get_series_id()),
            year,
            month,
            value_sats: (cpi_entry.get_value()
                * (1.0
                    / self
                        .btc_price_history
                        .get_average_price_for_month(year, month)?
                    * 100000000.0)) as i32,
        })
    }
}

#[derive(Debug, Serialize)]
pub struct BPISeriesEntry {
    series_id: String,
    year: i32,
    month: i32,
    value_sats: i32,
}

#[derive(Debug, Serialize)]
pub struct BPISeriesRange {
    item_code: ItemCode,
    area_code: AreaCode,
    start_year: i32,
    start_month: i32,
    end_year: i32,
    end_month: i32,
}
