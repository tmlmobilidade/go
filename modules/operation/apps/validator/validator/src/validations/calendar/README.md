# calendar.txt

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
