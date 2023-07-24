#[macro_use]
extern crate rocket;

use chrono::Datelike;
use chrono::{TimeZone, Utc};
use rocket::{
    response::{content, status},
    Request, State,
};

mod bpi;

use bpi::{AreaCode, ItemCode};

const FAVICON_BYTES: &[u8] = include_bytes!("../../client/out/favicon.ico");
const HTML_BYTES: &[u8] = include_bytes!("../../client/out/index.html");
const JS_BUNDLE_BYTES: &[u8] = include_bytes!("../../client/out/bundle.js");

enum NotFoundResponse {
    Html(status::Custom<content::Html<&'static [u8]>>),
    JavaScript(status::Custom<content::JavaScript<&'static [u8]>>),
    Favicon(Box<status::Custom<content::Custom<&'static [u8]>>>),
    NotFound(status::NotFound<String>),
}

impl<'r> rocket::response::Responder<'r, 'static> for NotFoundResponse {
    fn respond_to(
        self,
        request: &'r Request<'_>,
    ) -> Result<rocket::response::Response<'static>, rocket::http::Status> {
        match self {
            NotFoundResponse::Html(html) => html.respond_to(request),
            NotFoundResponse::JavaScript(javascript) => javascript.respond_to(request),
            NotFoundResponse::Favicon(favicon) => favicon.respond_to(request),
            NotFoundResponse::NotFound(not_found) => not_found.respond_to(request),
        }
    }
}

#[catch(404)]
fn not_found_handler(req: &Request) -> NotFoundResponse {
    let last_chunk = match req.uri().path().split('/').last() {
        Some(raw_str) => raw_str.as_str().to_string(),
        None => "".to_string(),
    };

    if req
        .uri()
        .path()
        .split('/')
        .find(|chunk| !chunk.is_empty())
        .unwrap_or_else(|| "".into())
        == "api"
    {
        NotFoundResponse::NotFound(status::NotFound(format!(
            "404 - API path '{}' does not exist!",
            req.uri().path()
        )))
    } else if last_chunk == "bundle.js" {
        NotFoundResponse::JavaScript(status::Custom(
            rocket::http::Status::Ok,
            content::JavaScript(JS_BUNDLE_BYTES),
        ))
    } else if last_chunk == "favicon.ico" {
        NotFoundResponse::Favicon(Box::from(status::Custom(
            rocket::http::Status::Ok,
            content::Custom(rocket::http::ContentType::Icon, FAVICON_BYTES),
        )))
    } else {
        NotFoundResponse::Html(status::Custom(
            rocket::http::Status::Ok,
            content::Html(HTML_BYTES),
        ))
    }
}

#[get("/bpi/item?<item_code>&<area_code>&<start_year>&<start_month>&<end_year>&<end_month>")]
fn bpi_item_handler(
    item_code: ItemCode,
    area_code: AreaCode,
    start_year: Option<i32>,
    start_month: Option<u32>,
    end_year: Option<i32>,
    end_month: Option<u32>,
    bpi_engine: &State<bpi::BPIEngine>,
) -> rocket::response::content::Json<String> {
    let start_or = if start_year.is_some() || start_month.is_some() {
        let start_year = start_year.unwrap_or_else(|| chrono::Utc::now().date().year()); // Default to current year.
        let start_month = start_month.unwrap_or(1); // Default to January.

        Some(Utc.ymd(start_year, start_month, 1))
    } else {
        None
    };

    let end_or = if end_year.is_some() || end_month.is_some() {
        let end_year = end_year.unwrap_or_else(|| chrono::Utc::now().date().year()); // Default to current year.
        let end_month = end_month.unwrap_or(12); // Default to December.

        Some(Utc.ymd(end_year, end_month, 1)) // TODO - Find a way to get last day of month instead of first.
    } else {
        None
    };

    rocket::response::content::Json(
        // TODO - Don't hardcode to `Daily` - set this based on a request parameter.
        serde_json::json!(bpi_engine.get_series_data(
            item_code,
            area_code,
            start_or,
            end_or,
            bpi::InterpolationInterval::Daily
        ))
        .to_string(),
    )
}

#[get("/bpi/datasets")]
fn bpi_datasets_handler(
    bpi_engine: &State<bpi::BPIEngine>,
) -> rocket::response::content::Json<String> {
    rocket::response::content::Json(
        serde_json::json!(bpi_engine.get_valid_series_ranges()).to_string(),
    )
}

#[get("/bpi/areas")]
fn bpi_areas_handler(
    bpi_engine: &State<bpi::BPIEngine>,
) -> rocket::response::content::Json<String> {
    rocket::response::content::Json(serde_json::json!(bpi_engine.get_areas()).to_string())
}

#[get("/bpi/items")]
fn bpi_items_handler(
    bpi_engine: &State<bpi::BPIEngine>,
) -> rocket::response::content::Json<String> {
    rocket::response::content::Json(serde_json::json!(bpi_engine.get_items()).to_string())
}

#[rocket::launch]
fn rocket() -> _ {
    println!("Building BPI index...");
    let bpi_engine = bpi::BPIEngine::new();
    println!(
        "BPI index complete! Found {} items across {} areas.",
        bpi_engine.get_items().len(),
        bpi_engine.get_areas().len()
    );
    println!("Starting server...");
    rocket::build()
        .manage(bpi_engine)
        .register("/", catchers![not_found_handler])
        .mount(
            "/api",
            routes![
                bpi_item_handler,
                bpi_datasets_handler,
                bpi_areas_handler,
                bpi_items_handler
            ],
        )
}
