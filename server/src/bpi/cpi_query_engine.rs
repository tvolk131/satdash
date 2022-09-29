use super::cpi_ap::{
    get_areas, get_current_series_entries, get_items, Area, AreaCode, Item, ItemCode, SeriesEntry,
};

pub struct CpiQueryEngine {
    areas: Vec<Area>,
    items: Vec<Item>,
    series_entries: Vec<SeriesEntry>,
}

impl CpiQueryEngine {
    pub async fn new() -> Self {
        Self {
            areas: get_areas().await.unwrap(),
            items: get_items().await.unwrap(),
            series_entries: get_current_series_entries().await.unwrap(),
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
        area_code_or: Option<&AreaCode>,
        item_code_or: Option<&ItemCode>,
        start_year_or: Option<i32>,
        end_year_or: Option<i32>,
    ) -> Vec<&SeriesEntry> {
        let mut filtered_series_entries: Vec<&SeriesEntry> = self
            .series_entries
            .iter()
            .filter(|series_entry| {
                if let Some(area_code) = area_code_or {
                    if series_entry.get_area_code() != area_code {
                        return false;
                    }
                }

                if let Some(item_code) = item_code_or {
                    if series_entry.get_item_code() != item_code {
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
            .collect();

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
