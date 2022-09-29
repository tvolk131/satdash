use serde::{de::value::MapDeserializer, Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Area {
    area_code: String,
    area_name: String,
}

impl Area {
    pub fn get_area_code(&self) -> &str {
        &self.area_code
    }
}

pub async fn get_areas() -> Result<Vec<Area>, reqwest::Error> {
    get_data_sheet("https://download.bls.gov/pub/time.series/ap/ap.area").await
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    item_code: String,
    item_name: String,
}

impl Item {
    pub fn get_item_code(&self) -> &str {
        &self.item_code
    }
}

pub async fn get_items() -> Result<Vec<Item>, reqwest::Error> {
    get_data_sheet("https://download.bls.gov/pub/time.series/ap/ap.item").await
}

#[derive(Debug, Deserialize)]
pub struct SeriesEntry {
    series_id: String,
    year: String,
    period: String,
    value: String,
}

impl SeriesEntry {
    pub fn get_series_id(&self) -> &str {
        &self.series_id
    }

    pub fn get_area_code(&self) -> &str {
        &self.series_id[3..7]
    }

    pub fn get_item_code(&self) -> &str {
        &self.series_id[7..]
    }

    pub fn get_year(&self) -> i32 {
        self.year.parse().unwrap()
    }

    pub fn get_period(&self) -> i32 {
        self.period[1..].parse().unwrap()
    }

    pub fn get_value(&self) -> f64 {
        self.value.parse().unwrap()
    }
}

pub async fn get_current_series_entries() -> Result<Vec<SeriesEntry>, reqwest::Error> {
    get_data_sheet("https://download.bls.gov/pub/time.series/ap/ap.data.0.Current").await
}

async fn get_data_sheet<'de, T: Deserialize<'de>>(url: &str) -> Result<Vec<T>, reqwest::Error> {
    let resp = reqwest::get(url).await?.text().await?;

    let mut line_iter = resp.split('\n');
    let column_names: Vec<&str> = line_iter
        .next()
        .unwrap()
        .split('\t')
        .map(|segment| segment.trim())
        .collect();
    let mut lines: Vec<&str> = line_iter.collect();
    // Remove the last line, which is whitespace.
    // TODO - See if removing this line breaks anything. It might not...?
    lines.pop();

    let mut items = Vec::new();

    for line in lines {
        let mut item_map: HashMap<String, String> = HashMap::new();

        let column_values: Vec<&str> = line.split('\t').map(|segment| segment.trim()).collect();
        if column_names.len() != column_values.len() {
            panic!("Data is inconsistent!");
        }
        for (column_name, column_value) in column_names.iter().zip(column_values) {
            item_map.insert(column_name.to_string(), column_value.to_string());
        }

        let deserializer: MapDeserializer<
            '_,
            std::collections::hash_map::IntoIter<std::string::String, std::string::String>,
            serde::de::value::Error,
        > = MapDeserializer::new(item_map.into_iter());
        items.push(T::deserialize(deserializer).unwrap());
    }

    Ok(items)
}
