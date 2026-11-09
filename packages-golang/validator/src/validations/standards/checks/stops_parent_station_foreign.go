package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: parent_station
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the parent location. Stops, entrances and generic nodes reference a station; boarding areas reference a
platform. A station must not itself have a parent_station.

Conditionally Required:
  - Required for locations which are entrances (`location_type=2`), generic nodes (`location_type=3`) or boarding
    areas (`location_type=4`).
  - Optional for stops/platforms (`location_type=0`).
  - Forbidden for stations (`location_type=1`).

Validation: Checks that each non-empty parent_station exists in stops.stop_id. It compares the original text
without trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its
format. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func ParentStationForeign(ctx *context.ValidationContext) error {
	return context.ForEachRow(ctx, "stops", []string{"parent_station"}, func(row *context.ValidationContext) error {
		if context.ShouldIgnore(row) {
			return nil
		}
		value, err := queries.Field(row.Source, "parent_station")
		if err != nil || value == "" {
			return err
		}
		exists, err := queries.Exists(row.Source.Table, "stop_id", value)
		if err != nil {
			return err
		}
		if !exists {
			context.AddMessage(row, context.GetTranslatedMessage(row, "not_found", value))
		}
		return nil
	})
}
