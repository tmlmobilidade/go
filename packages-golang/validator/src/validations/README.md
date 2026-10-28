# Validation structure

All rules share one flat layout. There are no folders per GTFS file:

```text
validations/
├── custom/
│   ├── checks/
│   └── tests/
├── fields/
│   ├── checks/
│   └── tests/
├── standard/
│   ├── checks/
│   └── tests/
├── utils/
└── main.go
```

`fields/checks` contains presence and conversion checks, `standard/checks` holds
GTFS constraints, and `custom/checks` holds project-specific constraints. Their
matching tests live directly in each category's `tests` directory. Filenames
carry the GTFS context, for example `trips_route_id.go`, instead of introducing
another directory level. Shared helpers and fixtures live directly in `utils`.

`main.go` contains registration and all DAG orchestration. Table dispatch still
selects the correct SQLite rows and grouped execution scope, but every action
binds to these same shared category packages. Each check keeps its existing rule
ID, diagnostic fields, severity handling, and dependency behavior. Colliding Go
helper/function names are qualified with their GTFS context.

The supplied `depends_on` edges control execution, with all ready rules finishing
before the next dependency level. Information, warning, and error findings block
dependents. Outcomes remain local to their row or group; unrelated data continues.
Feed-wide presence checks use `rules.Manager` without a source row.

Integration tests live in `standard/tests`. The layout test verifies that every
exported check is bound in `main.go`, that checks/tests are flat, and that no GTFS
file directories return. Previously empty validators remain registered as empty
functions in `main.go`; this restructuring does not add new rule behavior.

From `packages-golang/validator`, run:

```sh
go test ./src/validations/... ./src/services/... ./src/lib/rules/...
CGO_ENABLED=0 go build ./...
```

## agency reference

Transit agencies with service represented in this dataset.

**Presence**: Required<br>
**Primary key**: agency_id

`main.go` collects the actions from `fields/checks`, `standard/checks`, and `custom/checks` and runs
one DAG for each row. The folders organize implementations; execution order and
prerequisites come only from each rule's configured `depends_on` list.
Each category keeps its checks in `checks/` and its tests in `tests/`.
Shared SQLite test helpers live in `utils/`. Email validation belongs to
`custom/checks`; email presence is checked in `fields/checks`.
Each split rule has its own configuration key, severity, and options. For example,
set `agency_id_unique.depends_on` to `["agency_id_field"]` to require the presence
check to pass before checking uniqueness. No dependency is added automatically.

Agency rules receive a `services.SQLiteContext` identifying the current SQLite row.
Each rule requests its own field with `db.Agency.Field("agency_email")`, then validates
the returned text. Missing columns, SQL `NULL`, and empty cells are treated as
missing values. Database failures are returned as errors.

The ID rule uses `db.Agency.FieldWithCount("agency_id")` to fetch the value and its duplicate
count in one query. The ID/name comparison reads each field with
`db.Agency.Field`. Only column names are retained between
rules; field values are read from SQLite each time. No `types.Agency` conversion
is used.

`db.Agency` refers to the current agency row. To read another standard or custom
table, select it with `table, err := db.Table("routes")`, then select its row
with `table.At(rowIndex).Field("route_id")`. Row indexes are zero-based; rows
from different tables are not implicitly linked.

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|agency_id|Unique ID|Conditionally Required|Identifies a transit brand which is often synonymous with a transit agency. Note that in some cases, such as when a single agency operates multiple separate services, agencies and brands are distinct. This document uses the term "agency" in place of "brand". A dataset may contain data from multiple agencies. Conditionally Required:- Required when the dataset contains data for multiple transit agencies. - Recommended otherwise.|
|agency_name|Text|Required|Full name of the transit agency.|
|agency_url|URL|Required|URL of the transit agency.|
|agency_timezone|Timezone|Required|Timezone where the transit agency is located. If multiple agencies are specified in the dataset, each must have the same agency_timezone.|
|agency_lang|Language code|Optional|Primary language used by this transit agency. Should be provided to help GTFS consumers choose capitalization rules and other language-specific settings for the dataset.|
|agency_phone|Phone number|Optional|A voice telephone number for the specified agency. This field is a string value that presents the telephone number as typical for the agency's service area. It may contain punctuation marks to group the digits of the number. Dialable text (for example, TriMet's "503-238-RIDE") is permitted, but the field must not contain any other descriptive text.|
|agency_fare_url|URL|Optional|URL of a web page where a rider can purchase tickets or other fare instruments for that agency, or a web page containing information about that agency's fares.|
|agency_email|Email|Optional|Email address actively monitored by the agency’s customer service department. This email address should be a direct contact point where transit riders can reach a customer service representative at the agency.|

## calendar reference

Service dates specified using a weekly schedule with start and end dates.

**Presence**: <u>Conditionally Required</u>
- <u style='color:#ff3333'>Required</u>: unless all dates of service are defined in `calendar_dates.txt`.
- <u style='color:#ffcc00'>Optional</u>: otherwise.

**Primary key**: `service_id`

Calendar rules receive a `services.SQLiteContext` for the current SQLite row.
Date rules read `db.Calendar.Field("start_date")` or `db.Calendar.Field("end_date")`.
The service ID rule uses `db.Calendar.FieldWithCount("service_id")` to read the
value and count duplicates in `calendar` in one query. Row values are not cached.

Weekday checks read the seven weekday columns together and keep the existing
`calendar_values_parse` diagnostics. Rows with invalid weekday values skip the
remaining checks, as before. The configured rules run in `rules.json` dependency
order. SQLite read failures are reported as errors for the affected rule.

---

### Field Definitions
|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`service_id`|Unique ID|Required|Identifies a set of dates when service is available for one or more routes.|
|`monday`|Enum|Required|Indicates whether the service operates on all Mondays in the date range specified by the start_date and end_date fields. Note that exceptions for particular dates may be listed in calendar_dates.txt.<br><br>**Valid options are**:<ul><li>`1` - Service is available for all Mondays in the date range.</li><li>`0` - Service is not available for Mondays in the date range.</li></ul>|
|`tuesday`|Enum|Required|Functions in the same way as monday except applies to Tuesdays|
|`wednesday`|Enum|Required|Functions in the same way as monday except applies to Wednesdays|
|`thursday`|Enum|Required|Functions in the same way as monday except applies to Thursdays|
|`friday`|Enum|Required|Functions in the same way as monday except applies to Fridays|
|`saturday`|Enum|Required|Functions in the same way as monday except applies to Saturdays.|
|`sunday`|Enum|Required|Functions in the same way as monday except applies to Sundays.|
|`start_date`|Date|Required|Start service day for the service interval.|
|`end_date`|Date|Required|End service day for the service interval. This service day is included in the interval.|

## calendar_dates reference

Exceptions for the services defined in the `calendar.txt` file.

**Presence**: <u>Conditionally Required</u>
- <u style='color:#ff3333'>Required</u>: if `calendar.txt` is omitted. In which case calendar_dates.txt must contain all dates of service.
- <u style='color:#ffcc00'>Optional</u>: otherwise.

**Primary key**: `service_id`

---

The `calendar_dates.txt` table explicitly activates or disables service by date. It may be used in two ways.

**Recommended**: Use `calendar_dates.txt` in conjunction with `calendar.txt` to define exceptions to the default service patterns defined in `calendar.txt`. If service is generally regular, with a few changes on explicit dates (for instance, to accommodate special event services, or a school schedule), this is a good approach. In this case `calendar_dates.service_id` is a foreign ID referencing `calendar.service_id`.

**Alternate**: Omit `calendar.txt`, and specify each date of service in `calendar_dates.txt`. This allows for considerable service variation and accommodates service without normal weekly schedules. In this case `service_id` is an ID.

---

### Field Definitions
|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`service_id`|Foreign ID referencing calendar.service_id or ID|Required|Identifies a set of dates when a service exception occurs for one or more routes. Each (`service_id`, `date`) pair may only appear once in `calendar_dates.txt` if using `calendar.txt` and calendar_dates.txt in conjunction. If a `service_id` value appears in both `calendar.txt` and `calendar_dates.txt`, the information in `calendar_dates.txt` modifies the service information specified in `calendar.txt`.|
|`date`|Date|Required|Date when service exception occurs.|
|`exception_type`|Enum|Required|Indicates whether service is available on the date specified in the date field.<br>**Valid options are**:<ul><li>`1` - Service has been added for the specified date.</li><li>`2` - Service has been removed for the specified date.</li></ul>**Example**: Suppose a route has one set of trips available on holidays and another set of trips available on all other days. One `service_id` could correspond to the regular service schedule and another `service_id` could correspond to the holiday schedule. For a particular holiday, the `calendar_dates.txt` file could be used to add the holiday to the holiday `service_id` and to remove the holiday from the regular `service_id` schedule.|

## fare_attributes reference

**Presence:** Optional<br>
**Primary key:** `fare_id`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`fare_id`|Unique ID|Required|Identifies a fare class.|
|`price`|Non-negative float|Required|Fare price, in the unit specified by `currency_type`.|
|`currency_type`|Currency code|Required|Currency used to pay the fare.|
|`payment_method`|Enum|Required|Indicates when the fare must be paid.<br>Valid options are:<ul><li>`0` - Fare is paid on board.</li><li>`1` - Fare must be paid before boarding.</li></ul>|
|`transfers`|Enum|Required|Indicates the number of transfers permitted on this fare.<br>Valid options are:<ul><li>`0` - No transfers permitted on this fare.</li><li>`1` - Riders may transfer once.</li><li>`2` - Riders may transfer twice.</li><li>`empty` - Unlimited transfers are permitted.</li></ul>|
|`agency_id`|Foreign ID referencing `agency.agency_id`|Conditionally Required|Identifies the relevant agency for a fare.<br><br>**Conditionally Required**:<ul><li>Required if multiple agencies are defined in `agency.txt`.</li><li>Recommended otherwise.</li></ul>|
|`transfer_duration`|Non-negative integer|Optional|Length of time in seconds before a transfer expires.<br>When `transfers=0` this field may be used to indicate how long a ticket is valid for or it may be left empty.|

### Validation layout

- `fields/checks`: presence and forbidden-field rules (`fare_attributes_<field>_field`).
- `standard/checks`: value, uniqueness, and foreign-key rules; existing rule IDs are retained.
- `fields/tests` and `standard/tests`: one test file per check, using SQLite fixtures in `utils`.

Configure the field rules separately from value rules. Missing rule configurations default to Ignore.
`transfers` requires a header but permits empty values. `agency_id` presence is checked when multiple agencies exist.
The runner uses prepared SQLite tables; each numeric check parses its own value.

## fare_rules reference

The `fare_rules.txt` table specifies how fares in `fare_attributes.txt` apply to an itinerary. Most fare structures use some combination of the following rules:

- Fare depends on origin or destination stations.
- Fare depends on which zones the itinerary passes through.
- Fare depends on which route the itinerary uses.

For examples that demonstrate how to specify a fare structure with `fare_rules.txt` and `fare_attributes.txt`, see [FareExamples](https://code.google.com/p/googletransitdatafeed/wiki/FareExamples) in the GoogleTransitDataFeed open source project wiki.

**Presence:** Optional<br>
**Primary key:** `*`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`fare_id`|Foreign ID referencing `fare_attributes.fare_id`|Required|Identifies a fare class.|
|`route_id`|Foreign ID referencing `routes.route_id`|Optional|Identifies a route associated with the fare class. If several routes with the same fare attributes exist, create a record in `fare_rules.txt` for each route.<br><br><u>Example</u>: If fare class "b" is valid on route "TSW" and "TSE", the `fare_rules.txt` file would contain these records for the fare class:<br><br>`fare_id,route_id`<br>`b,TSW`<br>`b,TSE`|
|`origin_id`|Foreign ID referencing `stops.zone_id`|Optional|Identifies an origin zone. If a fare class has multiple origin zones, create a record in `fare_rules.txt` for each `origin_id`.<br><br><u>Example</u>: If fare class "b" is valid for all travel originating from either zone "2" or zone "8", the `fare_rules.txt` file would contain these records for the fare class: <br><br>`fare_id,...,origin_id`<br>`b,...,2`<br>`b,...,8`|
|`destination_id`|Foreign ID referencing `stops.zone_id`|Optional|Identifies a destination zone. If a fare class has multiple destination zones, create a record in `fare_rules.txt` for each `destination_id`.<br><br><u>Example</u>: The origin_id and destination_id fields could be used together to specify that fare class "b" is valid for travel between zones 3 and 4, and for travel between zones 3 and 5, the `fare_rules.txt` file would contain these records for the fare class:<br><br>`fare_id,...,origin_id,destination_id`<br>`b,...,3,4`<br>`b,...,3,5`|
|`contains_id`|Foreign ID referencing `stops.zone_id`|Optional|Identifies the zones that a rider will enter while using a given fare class.Used in some systems to calculate correct fare class.<br><hr> <u>Example</u>: If fare class "c" is associated with all travel on the GRT route that passes through zones 5, 6, and 7 the `fare_rules.txt` would contain these records:<br><br>`fare_id,route_id,...,contains_id`<br>`c,GRT,...,5`<br>`c,GRT,...,6`<br>`c,GRT,...,7`<br> <br>Because all contains_id zones must be matched for the fare to apply, an itinerary that passes through zones 5 and 6 but not zone 7 would not have fare class "c". For more detail, see https://code.google.com/p/googletransitdatafeed/wiki/FareExamples in the GoogleTransitDataFeed project wiki.|


## Validator structure

`main.go` registers five presence and five standard checks through a row-scoped
RuleRunner. Checks read current values through `SQLiteContext.FareRules`.
Presence uses `fare_rules_<field>_field`; reference checks use simplified IDs.
Configure presence separately and declare dependencies with `depends_on`.
Dependency outcomes apply to the current row only.

Reference checks query explicit columns:

- fare_id -> fare_attributes.fare_id
- route_id -> routes.route_id
- origin_id, destination_id, contains_id -> stops.zone_id

Zone checks no longer accept accidental matches against stop_id or stop_code
from the old combined ID map. Repeated zones are valid. Empty references are
handled by presence checks; SQLite read failures propagate to runner diagnostics.

The legacy parsed snapshot is removed. Mirrored tests use file-backed SQLite,
including missing columns, NULLs, quoted IDs, live updates, severity overrides,
reference failures, and row-local dependencies.

## feed_info reference

Dataset metadata, including publisher, version, and expiration information.

The file contains information about the dataset itself, rather than the services that the dataset describes. In some cases, the publisher of the dataset is a different entity than any of the agencies.

**Presence**: <u>Conditionally Required</u>
  <ul><li><u style='color:#ff3333'>Required</u> if `translations.txt` is provided.</li><li><u style='color:#ffcc00'>Recommended</u> otherwise.</li></ul><br>

**Primary key**: none

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`feed_publisher_name`|Text|Required|Full name of the organization that publishes the dataset. This may be the same as one of the `agency.agency_name` values.|
|`feed_publisher_url`|URL|Required|URL of the dataset publishing organization's website. This may be the same as one of the `agency.agency_url` values.|
|`feed_lang`|Language code|Required|Default language used for the text in this dataset. This setting helps GTFS consumers choose capitalization rules and other language-specific settings for the dataset. The file `translations.txt` can be used if the text needs to be translated into languages other than the default one.<br><br>The default language may be multilingual for datasets with the original text in multiple languages. In such cases, the `feed_lang` field should contain the language code `mul` defined by the norm ISO 639-2, and a translation for each language used in the dataset should be provided in `translations.txt`. If all the original text in the dataset is in the same language, then `mul` should not be used.<br><br><u>Example</u>: Consider a dataset from a multilingual country like Switzerland, with the original `stops.stop_name` field populated with stop names in different languages. Each stop name is written according to the dominant language in that stop’s geographic location, e.g. `Genève` for the French-speaking city of Geneva, `Zürich` for the German-speaking city of Zurich, and `Biel/Bienne` for the bilingual city of Biel/Bienne. The dataset `feed_lang` should be `mul` and translations would be provided in `translations.txt`, in German: `Genf`, `Zürich` and `Biel`; in French: `Genève`, `Zurich` and `Bienne`; in Italian: `Ginevra`, `Zurigo` and `Bienna`; and in English: `Geneva`, `Zurich` and `Biel/Bienne`.|
|default_lang|Language code|Optional|Defines the language that should be used when the data consumer doesn’t know the language of the rider. It will often be `en` (English).|
|`feed_start_date`|Date|Recommended|The dataset provides complete and reliable schedule information for service in the period from the beginning of the `feed_start_date` day to the end of the `feed_end_date` day. Both days may be left empty if unavailable. The `feed_end_date` date must not precede the `feed_start_date` date if both are given. It is recommended that dataset providers give schedule data outside this period to advise of likely future service, but dataset consumers should treat it mindful of its non-authoritative status. If `feed_start_date` or `feed_end_date` extend beyond the active calendar dates defined in `calendar.txt` and `calendar_dates.txt`, the dataset is making an explicit assertion that there is no service for dates within the `feed_start_date` or `feed_end_date` range but not included in the active calendar dates.|
|`feed_end_date`|Date|Recommended|(see above)|
|feed_version|Text|Recommended|String that indicates the current version of their GTFS dataset. GTFS-consuming applications can display this value to help dataset publishers determine whether the latest dataset has been incorporated.|
|`feed_contact_email`|Email|Optional|Email address for communication regarding the GTFS dataset and data publishing practices. `feed_contact_email` is a technical contact for GTFS-consuming applications. Provide customer service contact information through `agency.txt`. It's recommended that at least one of `feed_contact_email` or `feed_contact_url` are provided.|
|`feed_contact_url`|URL|Optional|URL for contact information, a web-form, support desk, or other tools for communication regarding the GTFS dataset and data publishing practices. `feed_contact_url` is a technical contact for GTFS-consuming applications. Provide customer service contact information through `agency.txt`. It's recommended that at least one of `feed_contact_url` or `feed_contact_email` are provided.|

## files reference

|File Name|Presence|Description|
|--- |--- |--- |
|`agency.txt`|Required|Transit agencies with service represented in this dataset.|
|`stops.txt`|Conditionally Required|Stops where vehicles pick up or drop off riders. Also defines stations and station entrances.<br><br>**Conditionally Required**:<ul><li>**Optional** if demand-responsive zones are defined in locations.geojson.</li><li>**Required** otherwise.</li></ul>|
|`routes.txt`|Required|Transit routes. A route is a group of trips that are displayed to riders as a single service.|
|`trips.txt`|Required|Trips for each route. A trip is a sequence of two or more stops that occur during a specific time period.|
|`stop_times.txt`|Required|Times that a vehicle arrives at and departs from stops for each trip.|
|`calendar.txt`|Conditionally Required|Service dates specified using a weekly schedule with start and end dates.<br><br>**Conditionally Required**:<ul><li>**Required** unless all dates of service are defined in `calendar_dates.txt`.</li><li>**Optional** otherwise.</li></ul>|
|`calendar_dates.txt`|Conditionally Required|Exceptions for the services defined in the `calendar.txt`. <br><br>**Conditionally Required**:<ul><li>**Required** if `calendar.txt` is omitted.</li><li>In which case `calendar_dates.txt` must contain all dates of service.</li><li>**Optional** otherwise.</li></ul>|
|`fare_attributes.txt`|Optional|Fare information for a transit agency's routes.|
|`fare_rules.txt`|Optional|Rules to apply fares for itineraries.|
|`timeframes.txt`|Optional|Date and time periods to use in fare rules for fares that depend on date and time factors.|
|`rider_categories.txt`|Optional|Defines categories of riders (e.g. elderly, student).|
|`fare_media.txt`|Optional|To describe the fare media that can be employed to use fare products. File `fare_media.txt` describes concepts that are not represented in `fare_attributes.txt` and `fare_rules.txt`. As such, the use of `fare_media.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_products.txt`|Optional|To describe the different types of tickets or fares that can be purchased by riders.File `fare_products.txt` describes fare products that are not represented in `fare_attributes.txt` and `fare_rules.txt`. As such, the use of `fare_products.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_leg_rules.txt`|Optional|Fare rules for individual legs of travel.File `fare_leg_rules.txt` provides a more detailed method for modeling fare structures. As such, the use of `fare_leg_rules.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_leg_join_rules.txt`|Optional|Rules for defining two or more legs should be considered as a single effective fare leg for the purposes of matching against rules in `fare_leg_rules.txt`|
|`fare_transfer_rules.txt`|Optional|Fare rules for transfers between legs of travel.Along with `fare_leg_rules.txt`, file `fare_transfer_rules.txt` provides a more detailed method for modeling fare structures. As such, the use of `fare_transfer_rules.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`areas.txt`|Optional|Area grouping of locations.|
|`stop_areas.txt`|Optional|Rules to assign stops to areas.|
|`networks.txt`|Conditionally Forbidden|Network grouping of routes.Conditionally Forbidden:<ul><li>**Forbidden** if network_id exists in `routes.txt`.</li><li>Optional otherwise.</li></ul>|
|`route_networks.txt`|Conditionally Forbidden|Rules to assign routes to networks.Conditionally Forbidden:<ul><li>**Forbidden** if network_id exists in `routes.txt`.</li><li>Optional otherwise.</li></ul>|
|`shapes.txt`|Optional|Rules for mapping vehicle travel paths, sometimes referred to as route alignments.|
|`frequencies.txt`|Optional|Headway (time between trips) for headway-based service or a compressed representation of fixed-schedule service.|
|`transfers.txt`|Optional|Rules for making connections at transfer points between routes.|
|`pathways.txt`|Optional|Pathways linking together locations within stations.|
|`levels.txt`|Conditionally Required|Levels within stations.Conditionally Required:<ul><li>**Required** when describing pathways with elevators (`pathway_mode=5`).</li><li>Optional otherwise.</li></ul>|
|`location_groups.txt`|Optional|A group of stops that together indicate locations where a rider may request pickup or drop off.|
|`location_group_stops.txt`|Optional|Rules to assign stops to location groups.|
|locations.geojson|Optional|Zones for rider pickup or drop-off requests by on-demand services, represented as GeoJSON polygons.|
|`booking_rules.txt`|Optional|Booking information for rider-requested services.|
|`translations.txt`|Optional|Translations of customer-facing dataset values.|
|`feed_info.txt`|Conditionally Required|Dataset metadata, including publisher, version, and expiration information.Conditionally Required:<ul><li>**Required** if `translations.txt` is provided.</li><li>Recommended otherwise.</li></ul>|
|`attributions.txt`|Optional|Dataset attributions.|

## frequencies reference

`main.go` registers ten checks in a single row-scoped RuleRunner action map.
Checks read current SQLite values through `SQLiteContext.Frequencies`. The
unused raw-frequency cache and whole-row parser have been removed.

- `fields/checks`: presence for trip_id, start_time, end_time, headway_secs,
  and exact_times, using `frequencies_<field>_field` IDs.
- `standard/checks`: trip references, time format, positive headways, and
  exact_times enum/options, using the simplified value-rule IDs.
- Mirrored tests use file-backed SQLite fixtures. Runner tests live in `tests`.

Presence and values are independently configurable. Declare dependencies with
`depends_on`; findings block dependents only on the current row. Numeric parse
failures belong to their value check and do not suppress independent checks.

Existing semantics are preserved: times use `lib.ValidateTime`, headways must be
positive integers, and exact_times accepts 0/1 with configured options. Despite
legacy rule names, there are no headway/trip alignment, fixed-trip restrictions,
interval ordering, or overlap checks in this migration. The exact_times options
message now receives a string matching its translation placeholder.

## levels reference

`main.go` registers five checks in one row-scoped RuleRunner action map. All
values are read directly through the existing `SQLiteContext.Levels` binding.

- `fields/checks`: presence under `levels_level_id_field`,
  `levels_level_index_field`, and `levels_level_name_field`.
- `standard/checks`: unique IDs (`levels_level_id_unique`) and non-negative float32
  indices (`levels_level_index_valid`), using the simplified value-rule IDs.
- Mirrored check tests and runner tests use real file-backed SQLite fixtures.

Configure presence separately from values; the old presence-only `level_name`
rule is replaced by `levels_level_name_field`. Declare dependencies explicitly
with `depends_on`; their outcomes are local to each row. Malformed indices are
reported by the index check instead of discarding the entire parsed row.

The existing non-negative index restriction is preserved. This migration does
not add ordering, index uniqueness, or additional numeric constraints.

## pathways reference

`main.go` runs 12 presence checks and 10 standard checks through one row-scoped
RuleRunner action map. Checks read current SQLite values through `Pathways`.
Presence rules use `pathways_<field>_field`; standard checks use simplified rule IDs.
Configure dependencies explicitly with `depends_on`. Signage checks are now
presence-only field checks. Numeric parsing occurs inside the relevant value
check, so malformed values no longer suppress independent checks on the row.

Mode-dependent length/slope presence messages remain in field checks. Stop
references retain location-type/access checks, including the existing difference
in malformed-stop handling between origin and destination. Missing or malformed
pathway modes no longer cause nil-pointer panics.

Existing value semantics are preserved: stair_count uses an unsigned 16-bit
integer; min_width below one emits the recommendation; max_slope retains its
mode restriction and literal "0" exception. Wildcard options retain the previous
early return before the exit-gate direction check. No additional GTFS constraints
are introduced by this structural migration.

Mirrored tests use file-backed SQLite fixtures and verify severity, source rows,
missing/NULL values, options, references, and conditional behavior.

## rider_categories reference

`main.go` registers seven checks in one row-scoped `RuleRunner` action map. Each
check reads current values through `SQLiteContext.RiderCategories`; prepared
tables share schema information without caching row values.

- `fields/checks`: presence of rider_category_id, rider_category_name,
  is_default_fare_category, and eligibility_url. Rule IDs follow
  `rider_categories_<field>_field`.
- `standard/checks`: unique IDs, default-category enum/options, and URL format.
  These use simplified value-rule IDs.
- Mirrored `fields/tests` and `standard/tests` use real SQLite fixtures.

Configure presence independently from value checks, including the new
`rider_categories_rider_category_name_field` in place of the old presence-only
`rider_category_name_non_empty`. Dependencies are explicit `depends_on` entries
and apply independently on each row. Malformed enum values do not suppress
unrelated checks.

The `rider_categories_is_default_fare_category_valid` rule validates
0/1 and configured options, matching its previous implementation. It does not
check default-category uniqueness or fare-product membership.

## routes reference

Transit routes. A route is a group of trips that are displayed to riders as a single service.

**Presence**: <u>Required</u>
**Primary key**: `route_id`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`route_id`|Unique ID|Required|Identifies a route.|
|`agency_id`|Foreign ID referencing agency.txt|Conditionally Required|Agency for the specified route.<br><br>**Conditionally Required**:<ul><li>**Required** if multiple agencies are defined in agency.txt.</li><li>Recommended otherwise.</li></ul>|
|`route_short_name`|Text|Conditionally Required|Short name of a route. Often a short, abstract identifier (e.g., "32", "100X", "Green") that riders use to identify a route. Both `route_short_name` and `route_long_name` may be defined.<br><br>**Conditionally Required**:<ul><li>**Required** if routes.`route_long_name` is empty.</li><li>Recommended if there is a brief service designation. This should be the commonly-known passenger name of the service, and should be no longer than 12 characters.</li></ul>|
|`route_long_name`|Text|Conditionally Required|Full name of a route. This name is generally more descriptive than the `route_short_name` and often includes the route's destination or stop. Both `route_short_name` and `route_long_name` may be defined.<br><br>**Conditionally Required**:<ul><li>**Required** if routes.`route_short_name` is empty.</li><li>Optional otherwise.</li></ul>|
|`route_desc`|Text|Optional|Description of a route that provides useful, quality information. Should not be a duplicate of `route_short_name` or `route_long_name`.<br><br>Example: "A" trains operate between Inwood-207 St, Manhattan and Far Rockaway-Mott Avenue, Queens at all times. Also from about 6AM until about midnight, additional "A" trains operate between Inwood-207 St and Lefferts Boulevard (trains typically alternate between Lefferts Blvd and Far Rockaway).|
|`route_type`|Enum|Required|Indicates the type of transportation used on a route.<br>Valid options are:<br><br>`0` - Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.<br>`1` - Subway, Metro. Any underground rail system within a metropolitan area.<br>`2` - Rail. Used for intercity or long-distance travel.<br>`3` - Bus. Used for short- and long-distance bus routes.<br>`4` - Ferry. Used for short- and long-distance boat service.<br>`5` - Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle (e.g., cable car in San Francisco).<br>`6` - Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.<br>`7` - Funicular. Any rail system designed for steep inclines.<br>`11` - Trolleybus. Electric buses that draw power from overhead wires using poles.<br>`12` - Monorail. Railway in which the track consists of a single rail or a beam.|
|`route_url`|URL|Optional|URL of a web page about the particular route. Should be different from the agency.`agency_url` value.|
|`route_color`|Color|Optional|Route color designation that matches public facing material. Defaults to white (`FFFFFF`) when omitted or left empty. The color difference between `route_color` and `route_text_color` should provide sufficient contrast when viewed on a black and white screen.|
|`route_text_color`|Color|Optional|Legible color to use for text drawn against a background of `route_color`. Defaults to black (000000) when omitted or left empty. The color difference between `route_color` and `route_text_color` should provide sufficient contrast when viewed on a black and white screen.|
|`route_sort_order`|Non-negative integer|Optional|Orders the routes in a way which is ideal for presentation to customers. Routes with smaller `route_sort_order` values should be displayed first.|
|`continuous_pickup`|Enum|Conditionally Forbidden|Indicates that the rider can board the transit vehicle at any point along the vehicle’s travel path as described by shapes.txt, on every trip of the route.<br>Valid options are:<br><br>`0` - Continuous stopping pickup.<br>`1` or empty - No continuous stopping pickup.<br>`2` - Must phone agency to arrange continuous stopping pickup.<br>`3` - Must coordinate with driver to arrange continuous stopping pickup.<br><br>Values for routes.`continuous_pickup` may be overridden by defining values in `stop_times.continuous_pickup` for specific `stop_times` along the route.<br><br>**Conditionally Forbidden**:<ul><li>**Forbidden** if `stop_times.start_pickup_drop_off_window` or `stop_times.end_pickup_drop_off_window` are defined for any trip of this route. </li><li>Optional otherwise.</li></ul>|
|`continuous_drop_off`|Enum|Conditionally Forbidden|Indicates that the rider can alight from the transit vehicle at any point along the vehicle’s travel path as described by shapes.txt, on every trip of the route.<br>Valid options are:<br>`0` - Continuous stopping drop off.<br>`1` or empty - No continuous stopping drop off.<br>`2` - Must phone agency to arrange continuous stopping drop off.<br>`3` - Must coordinate with driver to arrange continuous stopping drop off.<br>Values for routes.`continuous_drop_off` may be overridden by defining values in `stop_times._continuous_drop_off` for specific `stop_times` along the route.<br><br>**Conditionally Forbidden**:<ul><li>**Forbidden** if `stop_times.start_pickup_drop_off_window` or `stop_times.end_pickup_drop_off_window` are defined for any trip of this route. </li><li>Optional otherwise.</li></ul>|
|`network_id`|ID|Conditionally Forbidden|Identifies a group of routes.<br>Multiple rows in routes.txt may have the same `network_id`.<br><br>**Conditionally Forbidden**:<ul><li>Forbidden if the `route_networks`.txt file exists.</li><li>Optional otherwise.</li></ul>|

## shapes reference

Shapes describe the path that a vehicle travels along a route alignment, and are defined in the file shapes.txt. Shapes are associated with Trips, and consist of a sequence of points through which the vehicle passes in order. Shapes do not need to intercept the location of Stops exactly, but all Stops on a trip should lie within a small distance of the shape for that trip, i.e. close to straight line segments connecting the shape points. The shapes.txt file should be included for all route-based services (not for zone-based demand-responsive services).

**Presence**: Optional<br>
**Primary key**: none

---

### Geometric validation options

These two checks compare consecutive points within each `shape_id`, ordered by
`shape_pt_sequence`. Sequences may start at zero and need not be consecutive.
Both checks are disabled unless their severity is configured.

| Rule ID | What it checks | Options |
| --- | --- | --- |
| `shapes_shape_point_spacing_valid` | Haversine distance between consecutive coordinates exceeds the configured maximum. This does not compare cumulative distance and does not require `shape_dist_traveled`. | `["1000"]`: maximum gap in metres; default 1000, must be positive. |
| `shapes_shape_dist_traveled_segment_valid` | Absolute difference between the recorded distance increment and the Haversine segment exceeds the tolerance. Includes the first segment starting at distance zero and zero increments between different coordinates. | `["20", "km"]`: tolerance in metres and optional recorded-distance unit (`m` or `km`). Default tolerance 20; zero is allowed. |

Invalid or nonfinite tolerances fall back to the defaults. Without a recognized
unit option, the distance check retains automatic conversion: a shape's maximum
recorded distance below 800 is treated as kilometres, otherwise as metres. This
heuristic is ambiguous for short shapes recorded in metres; use an explicit unit
when known. For example, `["20", "m"]` compares metre values with a 20-metre
tolerance. This unit option applies only to the segment rule.

Missing or invalid coordinates break the comparison chain; points on either side
are never joined into an invented segment. Missing, negative or duplicate sequences
make the ordering ambiguous, so both checks skip that shape. The segment check
skips pairs with missing, negative or nonfinite recorded distances. Decreasing
distances belong to the separate monotonic-distance rule.

These thresholds are configurable quality checks. The
[GTFS shapes reference](https://gtfs.org/documentation/schedule/reference/#shapestxt)
requires consistent distance units with `stop_times.txt`, but does not prescribe
metres, kilometres, a maximum coordinate gap, or this Haversine tolerance.

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`shape_id`|ID|Required|Identifies a shape.|
|`shape_pt_lat`|Latitude|Required|Latitude of a shape point. Each record in `shapes.txt` represents a shape point used to define the shape.|
|`shape_pt_lon`|Longitude|Required|Longitude of a shape point.|
|`shape_pt_sequence`|Non-negative integer|Required|Sequence in which the shape points connect to form the shape.<br>Values must increase along the trip but do not need to be consecutive.<br><br><u>Example</u>: If the shape "`A_shp`" has three points in its definition, the `shapes.txt` file might contain these records to define the shape:<br>`shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence`<br>`A_shp,37.61956,-122.48161,0`<br>`A_shp,37.64430,-122.41070,6`<br>`A_shp,37.65863,-122.30839,11`|
|`shape_dist_traveled`|Non-negative float|Optional|Actual distance traveled along the shape from the first shape point to the point specified in this record. Used by trip planners to show the correct portion of the shape on a map. Values must increase along with `shape_pt_sequence`; they must not be used to show reverse travel along a route. Distance units must be consistent with those used in `stop_times.txt`.<br><br><svg xmlns="http://www.w3.org/2000/svg" viewBox="-329 181 300 200" enable-background="new -329 181 300 200" style="background-color: white; width:300px;"><style type="text/css">.st0{fill:#FFFFFF;stroke:#010101;stroke-width:3;stroke-miterlimit:10;} .st1{fill:none;stroke:#010101;stroke-width:3;stroke-miterlimit:10;} .st2{fill:#010101;}</style><path id="XMLID_72_" class="st0" d="M-135 359.8v-156.9"/><path id="XMLID_70_" class="st1" d="M-116.6 252.1"/><circle id="XMLID_69_" class="st0" cx="-134.8" cy="196.9" r="6"/><path id="XMLID_60_" class="st2" d="M-140.5 280.4h11l-5.5 13.5z"/><path id="XMLID_71_" class="st2" d="M-140.5 359.8h11l-5.5 13.5z"/><path id="XMLID_58_" class="st2" d="M-140.5 222.7h11l-5.5 13.5z"/><path id="XMLID_13_" class="st2" d="M-59 293.9h-11l5.5-13.5z"/><path id="XMLID_12_" class="st2" d="M-106.3 328.1v-11l13.5 5.5z"/><path id="XMLID_6_" class="st2" d="M-95.1 257.6v-11l-13.5 5.5z"/><path id="XMLID_14_" class="st1" d="M-68.8 322.3h-62.2c-2.2 0-4-1.8-4-4v-62.3c0-2.2 1.8-4 4-4h62.2c2.2 0 4 1.8 4 4v62.2c0 2.3-1.8 4.1-4 4.1z"/><path id="XMLID_91_" class="st1" d="M-232.4 252.1"/><circle id="XMLID_90_" class="st0" cx="-250.6" cy="196.9" r="6"/><path id="XMLID_80_" class="st2" d="M-256.3 280.4h11l-5.5 13.5z"/><path id="XMLID_78_" class="st2" d="M-256.3 222.7h11l-5.5 13.5z"/><path id="XMLID_77_" class="st2" d="M-174.8 293.9h-11l5.5-13.5z"/><path id="XMLID_76_" class="st2" d="M-222.1 328.1v-11l13.5 5.5z"/><path id="XMLID_74_" class="st2" d="M-210.9 257.6v-11l-13.5 5.5z"/><path id="XMLID_92_" class="st2" d="M-298.2 257.6v-11l-13.5 5.5z"/><path id="XMLID_73_" class="st1" d="M-298.2 252h113.6c2.2 0 4 1.8 4 4v62.2c0 2.2-1.8 4-4 4h-62.2c-2.2 0-4-1.8-4-4v-115.3"/><script xmlns=""/></svg><br><br>Recommended for routes that have looping or inlining (the vehicle crosses or travels over the same portion of alignment in one trip). If a vehicle retraces or crosses the route alignment at points in the course of a trip, `shape_dist_traveled` is important to clarify how portions of the points in `shapes.txt` line up correspond with records in `stop_times.txt`.<br><br><u>Example</u>: If a bus travels along the three points defined above for `A_shp`, the additional `shape_dist_traveled` values (shown here in kilometers) would look like this:<br>`shape_id`,`shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled`<br>`A_shp,37.61956,-122.48161,0,0`<br>`A_shp,37.64430,-122.41070,6,6.8310`<br>`A_shp,37.65863,-122.30839,11,15.8765`|

## stop_times reference

Times that a vehicle arrives at and departs from stops for each trip.

**Presence**: Required<br>
**Primary key**: `trip_id`, `stop_sequence`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`trip_id`|Foreign ID referencing trips.trip_id|Required|Identifies a trip.|
|``arrival_time``|Time|Conditionally Required|Arrival time at the stop (defined by `stop_times.stop_id`) for a specific trip (defined by `stop_times.trip_id`) in the time zone specified by `agency.agency_timezone`, not `stops.stop_timezone`.<br><br>If there are not separate times for arrival and departure at a stop, `arrival_time` and `departure_time` should be the same. For times occurring after midnight on the service day, enter the time as a value greater than `24:00:00` in `HH:MM:SS`.<br><br>If exact arrival and departure times (`timepoint=1`) are not available, estimated or interpolated arrival and departure times (`timepoint=0`) should be provided.<br><br>**Conditionally Required**:<ul><li>Required for the first and last stop in a trip (defined by `stop_times.stop_sequence`).</li><li>Required for `timepoint=1`.</li><li>Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.</li></ul>|
|``departure_time``|Time|Conditionally Required|Departure time from the stop (defined by `stop_times.stop_id`) for a specific trip (defined by `stop_times.trip_id`) in the time zone specified by agency.agency_timezone, not stops.stop_timezone.<br><br>If there are not separate times for arrival and departure at a stop, `arrival_time` and `departure_time` should be the same. For times occurring after midnight on the service day, enter the time as a value greater than `24:00:00` in `HH:MM:SS`. If exact arrival and departure times (`timepoint=1`) are not available, estimated or interpolated arrival and departure times (`timepoint=0`) should be provided.<br><br>**Conditionally Required**:<ul><li>Required for `timepoint=1`.</li><li>Forbidden when `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.<li></ul>|
|`stop_id`|Foreign ID referencing stops.stop_id|Conditionally Required|Identifies the serviced stop. All stops serviced during a trip must have a record in `stop_times.txt`. Referenced locations must be stops/platforms, i.e. their `stops.location_type` value must be `0` or `empty`. A stop may be serviced multiple times in the same trip, and multiple trips and routes may service the same stop.<br><br>On-demand service using stops should be referenced in the sequence in which service is available at those stops. A data consumer should assume that travel is possible from one stop or location to any stop or location later in the trip, provided that the `pickup/drop_off_type` of each `stop_time` and the time constraints of each start/`end_pickup_drop_off_window` do not forbid it.<br><br>**Conditionally Required**:<ul><li>Required if `stop_times.location_group_id` AND `stop_times.location_id` are NOT defined.</li><li>Forbidden if `stop_times.location_group_id` or `stop_times.location_id` are defined.</li></ul>|
|`location_group_id`|Foreign ID referencing location_groups.location_group_id|Conditionally Forbidden|Identifies the serviced location group that indicates groups of stops where riders may request pickup or drop off. All location groups serviced during a trip must have a record in `stop_times.txt`. Multiple trips and routes may service the same location group.<br><br>On-demand service using location groups should be referenced in the sequence in which service is available at those location groups. A data consumer should assume that travel is possible from one stop or location to any stop or location later in the trip, provided that the pickup/drop_off_type of each `stop_time` and the time constraints of each start/`end_pickup_drop_off_window` do not forbid it.<br><br>**Conditionally Forbidden**:<ul><li>Forbidden if `stop_times.stop_id` or `stop_times.location_id` are defined.</li></ul>|
|`location_id`|Foreign ID referencing id from locations.geojson|Conditionally Forbidden|Identifies the GeoJSON location that corresponds to serviced zone where riders may request pickup or drop off. All GeoJSON locations serviced during a trip must have a record in `stop_times.txt`. Multiple trips and routes may service the same GeoJSON location.<br><br>On-demand service within locations should be referenced in the sequence in which service is available in those locations. A data consumer should assume that travel is possible from one stop or location to any stop or location later in the trip, provided that the pickup/drop_off_type of each `stop_time` and the time constraints of each start/`end_pickup_drop_off_window` do not forbid it.<br><br>**Conditionally Forbidden**:<ul><li>Forbidden if `stop_times.stop_id` or `stop_times.location_group_id` are defined.</li></ul>|
|`stop_sequence`|Non-negative integer|Required|Order of stops, location groups, or GeoJSON locations for a particular trip. The values must increase along the trip but do not need to be consecutive.<br><br>Example: The first location on the trip could have a `stop_sequence=1`, the second location on the trip could have a `stop_sequence=23`, the third location could have a `stop_sequence=40`, and so on.  Travel within the same location group or GeoJSON location requires two records in `stop_times.txt` with the same `location_group_id` or `location_id`.|
|`stop_headsign`|Text|Optional|Text that appears on signage identifying the trip's destination to riders. This field overrides the default `trips.trip_headsign` when the headsign changes between stops. If the headsign is displayed for an entire trip, `trips.trip_headsign` should be used instead.<br><br>A stop_headsign value specified for one `stop_time` does not apply to subsequent `stop_times` in the same trip. If you want to override the trip_headsign for multiple `stop_times` in the same trip, the stop_headsign value must be repeated in each `stop_time` row.|
|`start_pickup_drop_off_window`|Time|Conditionally Required|Time that on-demand service becomes available in a GeoJSON location, location group, or stop.<br><br>**Conditionally Required**:<ul><li>Required if `stop_times.location_group_id` or `stop_times.location_id` is defined.</li><li>Required if `end_pickup_drop_off_window` is defined.</li><li>Forbidden if `arrival_time` or `departure_time` is defined.</li><li>Optional otherwise.</li></ul>|
|`end_pickup_drop_off_window`|Time|Conditionally Required|Time that on-demand service ends in a GeoJSON location, location group, or stop.<br><br>**Conditionally Required**:<ul><li>Required if `stop_times.location_group_id` or `stop_times.location_id` is defined.</li><li>Required if `start_pickup_drop_off_window` is defined.</li><li>Forbidden if `arrival_time` or `departure_time` is defined.</li><li>Optional otherwise.</li></ul>|
|`pickup_type`|Enum|Conditionally Forbidden|Indicates pickup method.<br>**Valid options are**:<ul><li>`0` or `empty` - Regularly scheduled pickup.</li><li>`1` - No pickup available.</li><li>`2` - Must phone agency to arrange pickup.</li><li>`3` - Must coordinate with driver to arrange pickup.</li></ul>**Conditionally Forbidden**:<ul><li>`pickup_type=0` **forbidden** if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>`pickup_type=3` **forbidden** if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.</li></ul>|
|`drop_off_type`|Enum|Conditionally Forbidden|Indicates drop off method.<br>**Valid options are**:<ul><li>`0` or `empty` - Regularly scheduled drop off.</li><li>`1` - No drop off available.</li><li>`2` - Must phone agency to arrange drop off.</li><li>`3` - Must coordinate with driver to arrange drop off.</li></ul>**Conditionally Forbidden**:<ul><li>`0` **forbidden** if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.</li></ul>|
|`continuous_pickup`|Enum|Conditionally Forbidden|Indicates that the rider can board the transit vehicle at any point along the vehicle’s travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip’s stop_sequence.<br>**Valid options are**: <ul><li>`0` - Continuous stopping pickup.</li><li>`1` or `empty` - No continuous stopping pickup.</li><li>`2` - Must phone agency to arrange continuous stopping pickup.</li><li>`3` - Must coordinate with driver to arrange continuous stopping pickup.</li></ul> If this field is populated, it overrides any continuous pickup behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous pickup behavior defined in routes.txt.<br><br>**Conditionally Forbidden**:<ul><li>Forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.</li></ul>|
|`continuous_drop_off`|Enum|Conditionally Forbidden|Indicates that the rider can alight from the transit vehicle at any point along the vehicle’s travel path as described by shapes.txt, from this stop_time to the next stop_time in the trip’s stop_sequence.<br>**Valid options are**:<ul><li>`0` - Continuous stopping drop off.</li><li>`1` or `empty` - No continuous stopping drop off.</li><li>`2` - Must phone agency to arrange continuous stopping drop off.</li><li>`3` - Must coordinate with driver to arrange continuous stopping drop off.</li></ul>If this field is populated, it overrides any continuous drop-off behavior defined in routes.txt. If this field is empty, the stop_time inherits any continuous drop-off behavior defined in routes.txt.<br><br>**Conditionally Forbidden**:<ul><li>Forbidden if `start_pickup_drop_off_window` or `end_pickup_drop_off_window` are defined.</li><li>Optional otherwise.</li></ul>|
|shape_dist_traveled|Non-negative float|Optional|Actual distance traveled along the associated shape, from the first stop to the stop specified in this record. This field specifies how much of the shape to draw between any two stops during a trip. Must be in the same units used in shapes.txt. Values used for shape_dist_traveled must increase along with stop_sequence; they must not be used to show reverse travel along a route.<br><br>Recommended for routes that have looping or inlining (the vehicle crosses or travels over the same portion of alignment in one trip). See `shapes.shape_dist_traveled`.<br><br>**Example**: If a bus travels a distance of 5.25 kilometers from the start of the shape to the stop,`shape_dist_traveled=5.25`.|
|timepoint|Enum|Optional|Indicates if arrival and departure times for a stop are strictly adhered to by the vehicle or if they are instead approximate and/or interpolated times. This field allows a GTFS producer to provide interpolated stop-times, while indicating that the times are approximate.<br>**Valid options are**:<ul><li>`0` - Times are considered approximate.</li><li>`1` - Times are considered exact.</li></ul> All records of `stop_times.txt` with defined arrival or departure times should have timepoint values populated. If no timepoint values are provided, all times are considered exact.|
|`pickup_booking_rule_id`|Foreign ID referencing booking_rules.booking_rule_id|Optional|Identifies the boarding booking rule at this stop time.<br><br>Recommended when `pickup_type=2.`|
|`drop_off_booking_rule_id`|Foreign ID referencing booking_rules.booking_rule_id|Optional|Identifies the alighting booking rule at this stop time.<br><br>Recommended when `drop_off_type=2.`|

### On-demand Service Routing Behavior

- When providing routing or travel time between the origin and destination, data consumers should ignore intermediate stop_times.txt records with the same trip_id that have start_pickup_drop_off_window and end_pickup_drop_off_window defined. For examples that demonstrate what should be ignored, see the data example page.
- Simultaneous overlap of locations.geojson id geometry, start/end_pickup_drop_off_window time, and pickup_type or drop_off_type between two or more stop_times.txt records with the same trip_id is forbidden. For examples that demonstrate what is forbidden, see the data example page.

## stops reference

Stops where vehicles pick up or drop off riders. Also defines stations and station entrances.

**Presence**: <u>Conditionally Required</u>
- <u style='color:#ffcc00'>Optional</u>: if demand-responsive zones are defined in locations.geojson.
- <u style='color:#ff3333'>Required</u>: otherwise.

**Primary key**: stop_id

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|stop_id|Unique ID|Required|Identifies a location: stop/platform, station, entrance/exit, generic node or boarding area (see location_type). ID must be unique across all stops.stop_id, locations.geojson id, and location_groups.location_group_id values. Multiple routes may use the same stop_id.|
|stop_code|Text|Optional|Short text or a number that identifies the location for riders. These codes are often used in phone-based transit information systems or printed on signage to make it easier for riders to get information for a particular location. The stop_code may be the same as stop_id if it is public facing. This field should be left empty for locations without a code presented to riders.|
|stop_name|Text|Conditionally Required|Name of the location. The stop_name should match the agency's rider-facing name for the location as printed on a timetable, published online, or represented on signage. For translations into other languages, use translations.txt.When the location is a boarding area (location_type=4), the stop_name should contains the name of the boarding area as displayed by the agency. It could be just one letter (like on some European intercity railway stations), or text like “Wheelchair boarding area” (NYC’s Subway) or “Head of short trains” (Paris’ RER).Conditionally Required:- Required for locations which are stops (location_type=0), stations (location_type=1) or entrances/exits (location_type=2).- Optional for locations which are generic nodes (location_type=3) or boarding areas (location_type=4).|
|tts_stop_name|Text|Optional|Readable version of the stop_name. See "Text-to-speech field" in the Term Definitions for more.|
|stop_desc|Text|Optional|Description of the location that provides useful, quality information. Should not be a duplicate of stop_name.|
|stop_lat|Latitude|Conditionally Required|Latitude of the location.For stops/platforms (location_type=0) and boarding area (location_type=4), the coordinates must be the ones of the bus pole — if exists — and otherwise of where the travelers are boarding the vehicle (on the sidewalk or the platform, and not on the roadway or the track where the vehicle stops). Conditionally Required:- Required for locations which are stops (location_type=0), stations (location_type=1) or entrances/exits (location_type=2).- Optional for locations which are generic nodes (location_type=3) or boarding areas (location_type=4).|
|stop_lon|Longitude|Conditionally Required|Longitude of the location.For stops/platforms (location_type=0) and boarding area (location_type=4), the coordinates must be the ones of the bus pole — if exists — and otherwise of where the travelers are boarding the vehicle (on the sidewalk or the platform, and not on the roadway or the track where the vehicle stops). Conditionally Required:- Required for locations which are stops (location_type=0), stations (location_type=1) or entrances/exits (location_type=2).- Optional for locations which are generic nodes (location_type=3) or boarding areas (location_type=4).|
|zone_id|ID|Optional|Identifies the fare zone for a stop. If this record represents a station or station entrance, the zone_id is ignored.|
|stop_url|URL|Optional|URL of a web page about the location. This should be different from the agency.agency_url and the routes.route_url field values.|
|location_type|Enum|Optional|Location type. Valid options are:0 (or empty) - Stop (or Platform). A location where passengers board or disembark from a transit vehicle. Is called a platform when defined within a parent_station.1 - Station. A physical structure or area that contains one or more platform.2 - Entrance/Exit. A location where passengers can enter or exit a station from the street. If an entrance/exit belongs to multiple stations, it may be linked by pathways to both, but the data provider must pick one of them as parent.3 - Generic Node. A location within a station, not matching any other location_type, that may be used to link together pathways define in pathways.txt.4 - Boarding Area. A specific location on a platform, where passengers can board and/or alight vehicles.|
|parent_station|Foreign ID referencing stops.stop_id|Conditionally Required|Defines hierarchy between the different locations defined in stops.txt. It contains the ID of the parent location, as followed:- Stop/platform (location_type=0): the parent_station field contains the ID of a station.- Station (location_type=1): this field must be empty.- Entrance/exit (location_type=2) or generic node (location_type=3): the parent_station field contains the ID of a station (location_type=1)- Boarding Area (location_type=4): the parent_station field contains ID of a platform.Conditionally Required:- Required for locations which are entrances (location_type=2), generic nodes (location_type=3) or boarding areas (location_type=4).- Optional for stops/platforms (location_type=0).- Forbidden for stations (location_type=1).|
|stop_timezone|Timezone|Optional|Timezone of the location. If the location has a parent station, it inherits the parent station’s timezone instead of applying its own. Stations and parentless stops with empty stop_timezone inherit the timezone specified by agency.agency_timezone. The times provided in stop_times.txt are in the timezone specified by agency.agency_timezone, not stop_timezone. This ensures that the time values in a trip always increase over the course of a trip, regardless of which timezones the trip crosses.|
|wheelchair_boarding|Enum|Optional|Indicates whether wheelchair boardings are possible from the location. Valid options are: For parentless stops:0 or empty - No accessibility information for the stop.1 - Some vehicles at this stop can be boarded by a rider in a wheelchair.2 - Wheelchair boarding is not possible at this stop. For child stops: 0 or empty - Stop will inherit its wheelchair_boarding behavior from the parent station, if specified in the parent.1 - There exists some accessible path from outside the station to the specific stop/platform.2 - There exists no accessible path from outside the station to the specific stop/platform. For station entrances/exits: 0 or empty - Station entrance will inherit its wheelchair_boarding behavior from the parent station, if specified for the parent.1 - Station entrance is wheelchair accessible.2 - No accessible path from station entrance to stops/platforms.|
|level_id|Foreign ID referencing levels.level_id|Optional|Level of the location. The same level may be used by multiple unlinked stations.|
|platform_code|Text|Optional|Platform identifier for a platform stop (a stop belonging to a station). This should be just the platform identifier (eg. "G" or "3"). Words like “platform” or "track" (or the feed’s language-specific equivalent) should not be included. This allows feed consumers to more easily internationalize and localize the platform identifier into other languages.|

## transfers reference

`RunTransfersValidations` in `main.go` registers the prepared SQLite tables and runs one action map per
transfer row. Checks read current values through `db.Transfers`, with matching
reference lookups in stops, routes, and trips. There is no parsed transfer
snapshot or whole-row parser gate.

- `fields/checks`: eight presence checks using `transfers_<field>_field` IDs.
  Stop IDs are required for transfer types 1–3. Trip IDs are required for types
  4–5 and recommended otherwise. A missing route is not reported when its trip
  reference is present.
- `standard/checks`: eight checks retaining the existing value-rule IDs. These
  cover references, stop location types, distinct source/destination stops,
  trip/route consistency, transfer types 0–5 and configured options, and
  non-negative integer transfer times. Empty values belong to the field checks.
- `fields/tests` and `standard/tests`: mirrored SQLite fixtures covering missing
  columns, NULL/empty values, severity configuration, conditional requirements,
  reference mismatches and database failures.

The rule configuration's `depends_on` entries control prerequisite execution.
A failure affects only its source row; an invalid numeric field no longer
prevents independent checks from running on that row. Configure the new field
rules separately from the retained standard rules.

All current rules fit the field or standard categories, so there are no transfer checks in the shared custom category. Diagnostic translations are in `i18n-v2` for en/pt/es.

Run `go test ./validations/...` and `go build .` from the validator
`src` directory.

## trips reference

Trips for each route. A trip is a sequence of two or more stops that occur during a specific time period.

**Presence**: Required<br>
**Primary key**: `trip_id`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`route_id`|Foreign ID referencing `routes.route_id`|Required|Identifies a route.|
|`service_id`|Foreign ID referencing `calendar.service_id` or `calendar_dates.service_id`|Required|Identifies a set of dates when service is available for one or more routes.|
|`trip_id`|Unique ID|Required|Identifies a trip.|
|`trip_headsign`|Text|Optional|Text that appears on signage identifying the trip's destination to riders.<br>This field is recommended for all services with headsign text displayed on the vehicle which may be used to distinguish amongst trips in a route.<br><br>If the headsign changes during a trip, values for `trip_headsign` may be overridden by defining values in `stop_times.stop_headsign` for specific `stop_times` along the trip.|
|`trip_short_name`|Text|Optional|Public facing text used to identify the trip to riders, for instance, to identify train numbers for commuter rail trips.<br>If riders do not commonly rely on trip names, `trip_short_name` should be empty.<br><br>A `trip_short_name` value, if provided, should uniquely identify a trip within a service day; it should not be used for destination names or limited/express designations.|
|`direction_id`|Enum|Optional|Indicates the direction of travel for a trip. This field should not be used in routing; it provides a way to separate trips by direction when publishing time tables.<br><br>Valid options are:<br>`0` - Travel in one direction (e.g. outbound travel).<br>`1` - Travel in the opposite direction (e.g. inbound travel).<br><br>Example: The `trip_headsign` and `direction_id` fields may be used together to assign a name to travel in each direction for a set of trips. A `trips.txt` file could contain these records for use in time tables:  `trip_id`,...,`trip_headsign`,`direction_id`  1234,...,Airport,0  1505,...,Downtown,1|
|`block_id`|ID|Optional|Identifies the block to which the trip belongs. A block consists of a single trip or many sequential trips made using the same vehicle, defined by shared service days and `block_id.` A `block_id` may have trips with different service days, making distinct blocks.<br><br>See the example below. To provide in-seat transfers information, transfers of `transfer_type` 4 should be provided instead.|
|`shape_id`|Foreign ID referencing `shapes.shape_id`|Conditionally Required|Identifies a geospatial shape describing the vehicle travel path for a trip.<br><br>**Conditionally Required**:<ul><li>Required if the trip has a continuous pickup or drop-off behavior defined either in `routes.txt` or in `stop_times.txt`.</li><li>Optional otherwise.</li></ul>|
|`wheelchair_accessible`|Enum|Optional|Indicates wheelchair accessibility. <br><br>Valid options are:<br>`0` or empty - No accessibility information for the trip.<br>`1` - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.<br>`2` - No riders in wheelchairs can be accommodated on this trip.|
|`bikes_allowed`|Enum|Optional|Indicates whether bikes are allowed.<br><br>Valid options are:<br>`0` or empty - No bike information for the trip.<br>`1` - Vehicle being used on this particular trip can accommodate at least one bicycle.<br>`2` - No bicycles are allowed on this trip.|

#### Example: Blocks and service day

The example below is valid, with distinct blocks every day of the week.

|route_id|trip_id|service_id|block_id|(first stop time)|(last stop time)|
|--- |--- |--- |--- |--- |--- |
|red|trip_1|mon-tues-wed-thurs-fri-sat-sun|red_loop|22:00:00|22:55:00|
|red|trip_2|fri-sat-sun|red_loop|23:00:00|23:55:00|
|red|trip_3|fri-sat|red_loop|24:00:00|24:55:00|
|red|trip_4|mon-tues-wed-thurs|red_loop|20:00:00|20:50:00|
|red|trip_5|mon-tues-wed-thurs|red_loop|21:00:00|21:50:00|

<br>

**Notes on above table**:

- On Friday into Saturday morning, for example, a single vehicle operates trip_1, trip_2, and trip_3 (10:00 PM through 12:55 AM). Note that the last trip occurs on Saturday, 12:00 AM to 12:55 AM, but is part of the Friday “service day” because the times are 24:00:00 to 24:55:00.
- On Monday, Tuesday, Wednesday, and Thursday, a single vehicle operates trip_1, trip_4, and trip_5 in a block from 8:00 PM to 10:55 PM.

## Shape ID built from route and direction

`trips_shape_id_route_direction_match` checks that each trip has
`shape_id = route_id + "_" + direction_id`. For example, route `1001` in direction
`0` should use shape `1001_0`; direction `1` should use `1001_1`.

Recommended severity: `warning`, for both internal and external operators.
Configure the rule under `trips` with `{ "severity": "warning" }`. Like other
configurable checks, it remains ignored when omitted from the agency settings.
Its prerequisites are `trips_route_id_foreign`,
`trips_direction_id_valid`, and
`trips_shape_id_foreign`; they must be enabled and
pass before this check runs. Missing fields are handled by those rules.

## Validator structure

Checks read current SQLite values through `SQLiteContext` and are split into
`fields/checks`, `standard/checks`, and `custom/checks`, with mirrored tests.
Presence uses `trips_<field>_field`; existing value and group rule IDs remain.
The old presence-only IDs for headsign, short name, block and pattern are replaced
by the corresponding field rules. Configure dependent value/group checks with
`depends_on` entries for their required field checks.

`RunTripsValidations` in `main.go` registers one action map and executes row, route, pattern, and shape
phases through `RuleRunner`. Each group receives the outcomes of its own rows.
Pattern groups run before shape groups so only reported pattern conflicts
suppress duplicate shape findings. Group queries read SQLite directly; the run
retains only row identities, rule outcomes, validated stop-sequence hashes, and
reusable geometry results. The legacy parser, group orchestrators, and full-feed
precompute are removed.

Stop-sequence and stop-coordinate findings identify the `trips.txt` row being
validated, even though their inputs include `stop_times.txt`. This keeps those
findings under the trip rule's configured severity.

Run `go test ./validations/...` and `go build .` from the validator's `src`
directory. Translations for the migrated checks live in `i18n-v2` (en/pt/es).
