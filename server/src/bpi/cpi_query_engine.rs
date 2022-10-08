use super::cpi_ap::{
    get_areas, get_current_series_entries, get_items, Area, AreaCode, Item, ItemCode, SeriesEntry,
};
use chrono::{Date, Datelike, Utc};
use std::collections::HashMap;

pub struct CpiQueryEngine {
    areas: Vec<Area>,
    items: Vec<Item>,
    /// Contains all series entries, split by item code.
    /// Within each item code, all series entries are sorted chronologically.
    series_entries_by_item_and_area_code: HashMap<(ItemCode, AreaCode), Vec<SeriesEntry>>,
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
            series_entries_by_item_and_area_code,
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
        start_or: &Option<Date<Utc>>,
        end_or: &Option<Date<Utc>>,
    ) -> Vec<&SeriesEntry> {
        let filtered_series_entries: Vec<&SeriesEntry> = match self
            .series_entries_by_item_and_area_code
            .get(&(item_code, area_code))
        {
            Some(item_entries) => item_entries
                .iter()
                .filter(|series_entry| {
                    if let Some(start) = &start_or {
                        if series_entry.get_year() < start.year() {
                            return false;
                        }

                        if series_entry.get_year() == start.year()
                            && series_entry.get_month() < start.month()
                        {
                            return false;
                        }
                    }

                    if let Some(end) = &end_or {
                        if series_entry.get_year() > end.year() {
                            return false;
                        }

                        if series_entry.get_year() == end.year()
                            && series_entry.get_month() > end.month()
                        {
                            return false;
                        }
                    }

                    true
                })
                .collect(),
            None => return Vec::new(),
        };

        filtered_series_entries
    }
}
