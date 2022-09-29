use std::collections::HashMap;
use super::cpi_ap::{
    get_areas, get_current_series_entries, get_items, Area, AreaCode, Item, ItemCode, SeriesEntry
};

pub struct CpiQueryEngine {
    areas: Vec<Area>,
    items: Vec<Item>,
    series_entries_by_item_code: HashMap<ItemCode, Vec<SeriesEntry>>,
}

impl CpiQueryEngine {
    pub async fn new() -> Self {
        let mut series_entries_by_item_code = HashMap::new();

        for series_entry in get_current_series_entries().await.unwrap() {
            if !series_entries_by_item_code.contains_key(series_entry.get_item_code()) {
                series_entries_by_item_code.insert(series_entry.get_item_code().clone(), Vec::new());
            }

            // Note: unwrap is safe here because of the check above.
            let entries_by_item_code = series_entries_by_item_code.get_mut(series_entry.get_item_code()).unwrap();
            entries_by_item_code.push(series_entry);
        }

        Self {
            areas: get_areas().await.unwrap(),
            items: get_items().await.unwrap(),
            series_entries_by_item_code,
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
        item_code: &ItemCode,
        area_code_or: Option<&AreaCode>,
        start_year_or: Option<i32>,
        end_year_or: Option<i32>,
    ) -> Vec<&SeriesEntry> {
        let mut filtered_series_entries: Vec<&SeriesEntry> = match self
            .series_entries_by_item_code.get(item_code) {
                Some(item_entries) => {
                    item_entries.iter()
                        .filter(|series_entry| {
                            if let Some(area_code) = area_code_or {
                                if series_entry.get_area_code() != area_code {
                                    return false;
                                }
                            }
            
                            if let Some(start_year) = start_year_or {
                                if series_entry.get_year() < start_year {
                                    return false;
                                }
                            }
            
                            if let Some(end_year) = end_year_or {
                                if series_entry.get_year() > end_year {
                                    return false;
                                }
                            }
            
                            true
                        })
                        .collect()
                },
                None => return Vec::new()
            };

        // Sort results chronologically.
        filtered_series_entries.sort_by(|entry_a, entry_b| {
            let entry_a_year = entry_a.get_year();
            let entry_b_year = entry_b.get_year();

            if entry_a_year != entry_b_year {
                return entry_a_year.cmp(&entry_b_year);
            }

            entry_a.get_month().cmp(&entry_b.get_month())
        });

        filtered_series_entries
    }
}
