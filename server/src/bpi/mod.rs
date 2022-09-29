mod btc_csv;
mod cpi_ap;
mod cpi_query_engine;

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

    pub fn get_areas(&self) -> &Vec<cpi_ap::Area> {
        self.cpi_query_engine.get_areas()
    }

    pub fn get_items(&self) -> &Vec<cpi_ap::Item> {
        self.cpi_query_engine.get_items()
    }

    pub fn get_series_data(
        &self,
        area_code_or: Option<&str>,
        item_code_or: Option<&str>,
        start_year_or: Option<i32>,
        end_year_or: Option<i32>,
    ) -> Vec<BPISeriesEntry> {
        self.cpi_query_engine
            .get_series_data(area_code_or, item_code_or, start_year_or, end_year_or)
            .iter()
            .filter_map(|entry| self.cpi_entry_to_bpi_entry(entry))
            .collect()
    }

    pub fn get_valid_series_ranges(&self) -> Vec<BPISeriesRange> {
        let mut series_ranges = Vec::new();

        for item in self.get_items() {
            for area in self.get_areas() {
                let series_entries = self.get_series_data(
                    Some(area.get_area_code()),
                    Some(item.get_item_code()),
                    None,
                    None,
                );
                if let Some(first_entry) = series_entries.first() {
                    if let Some(last_entry) = series_entries.last() {
                        series_ranges.push(BPISeriesRange {
                            item_code: String::from(item.get_item_code()),
                            area_code: String::from(area.get_area_code()),
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

    fn cpi_entry_to_bpi_entry(&self, cpi_entry: &cpi_ap::SeriesEntry) -> Option<BPISeriesEntry> {
        let year = cpi_entry.get_year();
        let month = cpi_entry.get_period();

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
    item_code: String,
    area_code: String,
    start_year: i32,
    start_month: i32,
    end_year: i32,
    end_month: i32,
}
