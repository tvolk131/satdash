mod btc_price_history;
mod cpi_ap;
mod cpi_query_engine;
mod dated_series;

use chrono::{Date, Datelike, Utc};
use cpi_ap::{Area, Item};
pub use cpi_ap::{AreaCode, ItemCode};
use dated_series::DatedSeries;
use serde::Serialize;

pub struct BPIEngine {
    cpi_query_engine: cpi_query_engine::CpiQueryEngine,
    btc_price_history: btc_price_history::BTCPriceHistory,
    computed_valid_series_ranges: Vec<BPISeriesRange>,
}

impl BPIEngine {
    pub async fn new() -> Self {
        let mut bpi_engine = Self {
            cpi_query_engine: cpi_query_engine::CpiQueryEngine::new().await,
            btc_price_history: btc_price_history::BTCPriceHistory::new().await.unwrap(),
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
        start_or: Option<Date<Utc>>,
        end_or: Option<Date<Utc>>,
        interpolation_interval: InterpolationInterval,
    ) -> Vec<BPISeriesEntry> {
        let cpi_item_price_series =
            match self.cpi_query_engine.get_series_data(item_code, area_code) {
                Some(cpi_series) => cpi_series,
                None => return Vec::new(),
            };

        let bitcoin_price_series = self.btc_price_history.get_best_dataset();

        Self::slice_bpi_series(
            cpi_item_price_series,
            bitcoin_price_series,
            start_or,
            end_or,
            interpolation_interval,
        )
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
                    None,
                    None,
                    InterpolationInterval::Daily,
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

    fn slice_bpi_series(
        cpi_item_price_series: &DatedSeries,
        bitcoin_price_series: &DatedSeries,
        start_or: Option<Date<Utc>>,
        end_or: Option<Date<Utc>>,
        interpolation_interval: InterpolationInterval,
    ) -> Vec<BPISeriesEntry> {
        let mut start = match cpi_item_price_series.get_first_shared_date(bitcoin_price_series) {
            Some(start) => start,
            None => return Vec::new(),
        };
        if let Some(start_override) = start_or {
            start = std::cmp::max(start, start_override);
        }

        let mut end = match cpi_item_price_series.get_last_shared_date(bitcoin_price_series) {
            Some(start) => start,
            None => return Vec::new(),
        };
        if let Some(end_override) = end_or {
            end = std::cmp::max(end, end_override);
        }

        if start > end {
            return Vec::new();
        }

        Self::interpolate_dates(&start, &end, interpolation_interval)
            .into_iter()
            .filter_map(|date| {
                Some(BPISeriesEntry {
                    year: date.year(),
                    month: date.month(),
                    day: date.day(),
                    value_sats: (cpi_item_price_series.get_interpolated_price(date)?
                        * (1.0 / bitcoin_price_series.get_interpolated_price(date)? * 100000000.0))
                        as i32,
                })
            })
            .collect()
    }

    fn interpolate_dates(
        start_date: &Date<Utc>,
        end_date: &Date<Utc>,
        interval: InterpolationInterval,
    ) -> Vec<Date<Utc>> {
        match interval {
            InterpolationInterval::Daily => {
                let mut dates = Vec::new();

                let mut date = *start_date;
                while &date <= end_date {
                    dates.push(date);
                    date += chrono::Duration::days(1);
                }
                dates
            }
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BPISeriesEntry {
    year: i32,
    month: u32,
    day: u32,
    value_sats: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BPISeriesRange {
    item_code: ItemCode,
    area_code: AreaCode,
    start_year: i32,
    start_month: u32,
    end_year: i32,
    end_month: u32,
}

pub enum InterpolationInterval {
    Daily,
    // TODO - Uncomment the values below and implement them where necessary.
    // Weekly,
    // Monthly
}
