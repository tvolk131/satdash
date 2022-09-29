use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone)]
pub struct AreaCode(String);

impl<'a> rocket::form::FromFormField<'a> for AreaCode {
    fn from_value(field: rocket::form::ValueField<'a>) -> rocket::form::Result<'a, Self> {
        Ok(Self(String::from(field.value)))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Area {
    area_code: AreaCode,
    area_name: String,
}

impl Area {
    fn new_from_raw(raw_item: raw::RawArea) -> Self {
        Self {
            area_code: AreaCode(raw_item.area_code),
            area_name: raw_item.area_name,
        }
    }

    pub fn get_area_code(&self) -> &AreaCode {
        &self.area_code
    }
}

pub async fn get_areas() -> Result<Vec<Area>, reqwest::Error> {
    raw::get_raw_areas()
        .await
        .map(|raw_areas| raw_areas.into_iter().map(Area::new_from_raw).collect())
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone)]
pub struct ItemCode(String);

impl<'a> rocket::form::FromFormField<'a> for ItemCode {
    fn from_value(field: rocket::form::ValueField<'a>) -> rocket::form::Result<'a, Self> {
        Ok(Self(String::from(field.value)))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    item_code: ItemCode,
    item_name: String,
}

impl Item {
    fn new_from_raw(raw_item: raw::RawItem) -> Self {
        Self {
            item_code: ItemCode(raw_item.item_code),
            item_name: raw_item.item_name,
        }
    }

    pub fn get_item_code(&self) -> &ItemCode {
        &self.item_code
    }
}

pub async fn get_items() -> Result<Vec<Item>, reqwest::Error> {
    raw::get_raw_items()
        .await
        .map(|raw_items| raw_items.into_iter().map(Item::new_from_raw).collect())
}

#[derive(Debug, Deserialize)]
pub struct SeriesEntry {
    series_id: String,
    area_code: AreaCode,
    item_code: ItemCode,
    year: i32,
    month: i32,
    value: String,
}

impl SeriesEntry {
    fn new_from_raw(raw_series_entry: raw::RawSeriesEntry) -> Self {
        let area_code = raw_series_entry.get_area_code().to_string();
        let item_code = raw_series_entry.get_item_code().to_string();
        let month = raw_series_entry.get_period();

        Self {
            series_id: raw_series_entry.series_id,
            area_code: AreaCode(area_code),
            item_code: ItemCode(item_code),
            year: raw_series_entry.year.parse::<i32>().unwrap(),
            month,
            value: raw_series_entry.value,
        }
    }

    pub fn get_series_id(&self) -> &str {
        &self.series_id
    }

    pub fn get_area_code(&self) -> &AreaCode {
        &self.area_code
    }

    pub fn get_item_code(&self) -> &ItemCode {
        &self.item_code
    }

    pub fn get_year(&self) -> i32 {
        self.year
    }

    pub fn get_month(&self) -> i32 {
        self.month
    }

    pub fn get_value(&self) -> f64 {
        self.value.parse().unwrap()
    }
}

pub async fn get_current_series_entries() -> Result<Vec<SeriesEntry>, reqwest::Error> {
    raw::get_current_raw_series_entries()
        .await
        .map(|raw_series_entries| {
            raw_series_entries
                .into_iter()
                .map(SeriesEntry::new_from_raw)
                .collect()
        })
}

mod raw {
    use serde::{de::value::MapDeserializer, Deserialize, Serialize};
    use std::collections::HashMap;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct RawArea {
        pub area_code: String,
        pub area_name: String,
    }

    pub async fn get_raw_areas() -> Result<Vec<RawArea>, reqwest::Error> {
        get_data_sheet("https://download.bls.gov/pub/time.series/ap/ap.area").await
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct RawItem {
        pub item_code: String,
        pub item_name: String,
    }

    pub async fn get_raw_items() -> Result<Vec<RawItem>, reqwest::Error> {
        get_data_sheet("https://download.bls.gov/pub/time.series/ap/ap.item").await
    }

    #[derive(Debug, Deserialize)]
    pub struct RawSeriesEntry {
        pub series_id: String,
        pub year: String,
        pub period: String,
        pub value: String,
    }

    impl RawSeriesEntry {
        pub fn get_area_code(&self) -> &str {
            &self.series_id[3..7]
        }

        pub fn get_item_code(&self) -> &str {
            &self.series_id[7..]
        }

        pub fn get_period(&self) -> i32 {
            self.period[1..].parse().unwrap()
        }
    }

    pub async fn get_current_raw_series_entries() -> Result<Vec<RawSeriesEntry>, reqwest::Error> {
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
}
