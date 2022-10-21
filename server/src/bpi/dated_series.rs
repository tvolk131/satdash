use chrono::{Date, Utc};
use std::cmp::Ordering;
use std::collections::HashMap;

pub struct DatedSeries {
    /// List of price points, sorted by date from earliest to latest.
    sorted_series_items: Vec<PricePoint>,
}

impl DatedSeries {
    pub fn new(data: HashMap<Date<Utc>, f64>) -> Self {
        let mut sorted_series_items: Vec<PricePoint> = data
            .into_iter()
            .map(|(timestamp, price)| PricePoint { timestamp, price })
            .collect();
        sorted_series_items.sort_by(|a, b| a.timestamp.partial_cmp(&b.timestamp).unwrap());
        Self {
            sorted_series_items,
        }
    }

    /// Gets the estimated price at a particular instant. If we have a known price
    /// at the exact instant specified, we will return that value. Otherwise, we'll
    /// find the closest price before and after the specified instant and use linear
    /// interpolation to estimate the price.
    pub fn get_interpolated_price(&self, date: Date<Utc>) -> Option<f64> {
        match self.binary_search_sorted_price_point_vec_by_date(&date) {
            BinarySearchResult::ExactResult(data_point) => Some(data_point.price),
            // Perform linear interpolation between closest upper and lower points.
            BinarySearchResult::ClosestLowerAndUpperPoints(lower_data_point, upper_data_point) => {
                let lower_time_diff = date - lower_data_point.timestamp;
                let total_time_diff = upper_data_point.timestamp - lower_data_point.timestamp;
                let total_price_diff = upper_data_point.price - lower_data_point.price;

                let linear_slope = total_price_diff / (total_time_diff.num_milliseconds() as f64);
                Some(
                    lower_data_point.price
                        + ((lower_time_diff.num_milliseconds() as f64) * linear_slope),
                )
            }
            BinarySearchResult::MissingData => None,
        }
    }

    fn binary_search_sorted_price_point_vec_by_date<'a>(
        &'a self,
        target_instant: &Date<Utc>,
    ) -> BinarySearchResult<'a> {
        if self.sorted_series_items.is_empty() {
            return BinarySearchResult::MissingData;
        }

        let mut lower_bound = 0;
        let mut upper_bound = self.sorted_series_items.len();
        let mut mid;

        while lower_bound <= upper_bound {
            mid = (lower_bound + upper_bound) / 2; // Note - rounds down.
            let mid_point: &PricePoint = match self.sorted_series_items.get(mid) {
                Some(mid_point) => mid_point,
                None => return BinarySearchResult::MissingData,
            };

            match target_instant.cmp(&mid_point.timestamp) {
                Ordering::Less => {
                    if mid == 0 {
                        return BinarySearchResult::MissingData;
                    }
                    upper_bound = mid;
                }
                Ordering::Greater => {
                    if lower_bound == mid {
                        break;
                    }
                    lower_bound = mid;
                }
                Ordering::Equal => return BinarySearchResult::ExactResult(mid_point),
            };
        }

        // If we've reached this far, `upper_bound` and `lower_bound` have crossed.
        // This is why we're using them in what intuitively appears as the reverse.
        let closest_lower_data_point = match self.sorted_series_items.get(upper_bound) {
            Some(data_point) => data_point,
            None => return BinarySearchResult::MissingData,
        };
        let closest_upper_data_point = match self.sorted_series_items.get(lower_bound) {
            Some(data_point) => data_point,
            None => return BinarySearchResult::MissingData,
        };

        BinarySearchResult::ClosestLowerAndUpperPoints(
            closest_lower_data_point,
            closest_upper_data_point,
        )
    }

    pub fn get_first_entry_date(&self) -> Option<&Date<Utc>> {
        match self.sorted_series_items.first() {
            Some(first_item) => Some(&first_item.timestamp),
            None => None,
        }
    }

    pub fn get_last_entry_date(&self) -> Option<&Date<Utc>> {
        match self.sorted_series_items.last() {
            Some(last_item) => Some(&last_item.timestamp),
            None => None,
        }
    }

    pub fn get_first_shared_date(&self, other_series: &Self) -> Option<Date<Utc>> {
        let first_date_one = self.get_first_entry_date()?;
        let first_date_two = other_series.get_first_entry_date()?;
        Some(*std::cmp::max(first_date_one, first_date_two))
    }

    pub fn get_last_shared_date(&self, other_series: &Self) -> Option<Date<Utc>> {
        let last_date_one = self.get_last_entry_date()?;
        let last_date_two = other_series.get_last_entry_date()?;
        Some(*std::cmp::min(last_date_one, last_date_two))
    }
}

struct PricePoint {
    timestamp: Date<Utc>,
    price: f64,
}

enum BinarySearchResult<'a> {
    ExactResult(&'a PricePoint),
    ClosestLowerAndUpperPoints(&'a PricePoint, &'a PricePoint),
    MissingData,
}
