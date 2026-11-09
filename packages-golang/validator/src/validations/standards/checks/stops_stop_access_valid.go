package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_access
  - Presence: Conditionally Forbidden
  - Type: Enum

# Description

Specifies access to a platform: 0 through the station and its entrances or pathways, 1 directly from the street
network or empty for unspecified access.

Conditionally Forbidden:
  - Forbidden for locations which are stations (`location_type=1`), entrances (`location_type=2`), generic nodes
    (`location_type=3`) or boarding areas (`location_type=4`).
  - Forbidden if `parent_station` is empty.
  - Optional otherwise.

Validation: Checks that the populated value exactly matches one of 0, 1. Whitespace and letter case are preserved.
Configured value lists are not applied. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopAccessValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_access"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stop_access")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the stop_access is valid

		if value != "0" && value != "1" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
