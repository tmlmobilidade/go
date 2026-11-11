package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a stop, platform, station, entrance, generic node or boarding area. It must also be distinct from
identifiers in locations.geojson and location_groups.txt.

Validation: Checks that each non-empty stop_id occurs only once in stops.txt. It compares the original text without
trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopIdUnique(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the stop_id value

		value, count, err := queries.FieldWithCount(rowCtx.Source, "stop_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 3. Check if the stop_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
