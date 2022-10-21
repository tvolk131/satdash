use super::cpi_ap::{
    get_areas, get_current_series_entries, get_items, Area, AreaCode, Item, ItemCode,
};
use super::dated_series::DatedSeries;
use chrono::{TimeZone, Utc};
use std::collections::HashMap;

pub struct CpiQueryEngine {
    areas: Vec<Area>,
    items: Vec<Item>,
    /// Contains all series entries, split by item code.
    /// Within each item code, all series entries are sorted chronologically.
    series_by_item_and_area_code: HashMap<(ItemCode, AreaCode), DatedSeries>,
}

impl CpiQueryEngine {
    pub async fn new() -> Self {
        let mut series_entries_by_item_and_area_code = HashMap::new();

        for series_entry in get_current_series_entries().await.unwrap() {
            let item_and_area_code_key = (
                series_entry.get_item_code().clone(),
                series_entry.get_area_code().clone(),
            );

            if !series_entries_by_item_and_area_code.contains_key(&item_and_area_code_key) {
                series_entries_by_item_and_area_code.insert(
                    (
                        series_entry.get_item_code().clone(),
                        series_entry.get_area_code().clone(),
                    ),
                    Vec::new(),
                );
            }

            // Note: unwrap is safe here because of the check above.
            let entries_by_item_and_area_code = series_entries_by_item_and_area_code
                .get_mut(&item_and_area_code_key)
                .unwrap();
            entries_by_item_and_area_code.push(series_entry);
        }

        // Sort results for each item/area combo chronologically.
        for (_, series_list) in series_entries_by_item_and_area_code.iter_mut() {
            series_list.sort_by(|entry_a, entry_b| {
                let entry_a_year = entry_a.get_year();
                let entry_b_year = entry_b.get_year();

                if entry_a_year != entry_b_year {
                    return entry_a_year.cmp(&entry_b_year);
                }

                entry_a.get_month().cmp(&entry_b.get_month())
            });
        }

        Self {
            areas: get_areas().await.unwrap(),
            items: get_items().await.unwrap(),
            series_by_item_and_area_code: series_entries_by_item_and_area_code
                .into_iter()
                .map(|(key, series_entries)| {
                    let series_map = series_entries
                        .into_iter()
                        .map(|entry| {
                            (
                                Utc.ymd(entry.get_year(), entry.get_month(), 1), // TODO - Not sure if this should default to the 1st day of the month... Might make more sense to default to the middle of the month.
                                entry.get_value(),
                            )
                        })
                        .collect();

                    (key, DatedSeries::new(series_map))
                })
                .collect(),
        }
    }

    pub fn get_areas(&self) -> &Vec<Area> {
        &self.areas
    }

    pub fn get_items(&self) -> &Vec<Item> {
        &self.items
    }

    pub fn get_series_data(
        &self,
        item_code: ItemCode,
        area_code: AreaCode,
    ) -> Option<&DatedSeries> {
        self.series_by_item_and_area_code
            .get(&(item_code, area_code))
    }
}
