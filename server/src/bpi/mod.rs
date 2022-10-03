mod btc_csv;
mod cpi_ap;
mod cpi_query_engine;

use cpi_ap::{Area, Item, SeriesEntry};
pub use cpi_ap::{AreaCode, ItemCode};
use serde::{Deserialize, Serialize};

pub struct BPIEngine {
    cpi_query_engine: cpi_query_engine::CpiQueryEngine,
    btc_price_history: btc_csv::BTCPriceHistory,
    computed_valid_series_ranges: Vec<BPISeriesRange>,
}

impl BPIEngine {
    pub async fn new() -> Self {
        let mut bpi_engine = Self {
            cpi_query_engine: cpi_query_engine::CpiQueryEngine::new().await,
            btc_price_history: btc_csv::BTCPriceHistory::new_from_reader(include_bytes!(
                "../../BTC-USD.csv"
            ) as &[u8])
            .unwrap(),
            computed_valid_series_ranges: Vec::new(),
        };

        bpi_engine.compute_valid_series_ranges();

        bpi_engine
    }

    pub fn get_areas(&self) -> &Vec<Area> {
        self.cpi_query_engine.get_areas()
    }

    pub fn get_items(&self) -> &Vec<Item> {
        self.cpi_query_engine.get_items()
    }

    pub fn get_series_data(
        &self,
        item_code: ItemCode,
        area_code: AreaCode,
        start_or: &Option<MonthAndYear>,
        end_or: &Option<MonthAndYear>,
    ) -> Vec<BPISeriesEntry> {
        self.cpi_query_engine
            .get_series_data(item_code, area_code, start_or, end_or)
            .iter()
            .filter_map(|entry| self.cpi_entry_to_bpi_entry(entry))
            .collect()
    }

    pub fn get_valid_series_ranges(&self) -> &Vec<BPISeriesRange> {
        &self.computed_valid_series_ranges
    }

    fn compute_valid_series_ranges(&mut self) {
        let mut series_ranges = Vec::new();

        for item in self.get_items() {
            for area in self.get_areas() {
                let series_entries = self.get_series_data(
                    item.get_item_code().clone(),
                    area.get_area_code().clone(),
                    &None,
                    &None,
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

        self.computed_valid_series_ranges = series_ranges;
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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BPISeriesEntry {
    series_id: String,
    year: i32,
    month: i32,
    value_sats: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BPISeriesRange {
    item_code: ItemCode,
    area_code: AreaCode,
    start_year: i32,
    start_month: i32,
    end_year: i32,
    end_month: i32,
}

#[derive(Deserialize)]
pub struct MonthAndYear {
    year: i32,
    /// Number representing a month, with 0 being January and 11 being December.
    month: i32,
}

impl MonthAndYear {
    pub fn new(year: i32, month: i32) -> Self {
        Self { year, month }
    }

    pub fn get_year(&self) -> i32 {
        self.year
    }

    pub fn get_month(&self) -> i32 {
        self.month
    }
}
