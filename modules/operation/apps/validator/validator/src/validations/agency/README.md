
# agency.txt

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
