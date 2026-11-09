package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: [parent_station, location_type]
  - Presence: Conditionally Required, Optional
  - Type: Foreign ID referencing stops.stop_id, Enum

# Description

  - parent_station: Identifies the parent location. Stops, entrances and generic nodes reference a station; boarding
    areas reference a platform. A station must not itself have a parent_station.
  - location_type: Type of location: 0 or empty for a stop/platform, 1 station, 2 entrance/exit, 3 generic node or 4
    boarding area.

Validation: For a non-empty parent_station, requires the current row to have location_type exactly 1. This is the
behavior of this implementation: it does not inspect the type of the referenced parent and differs from the usual
GTFS hierarchy.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func ParentStationForLocationTypeOne(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"parent_station", "location_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		valueToValidate, err := queries.Field(rowCtx.Source, "parent_station")
		if err != nil {
			return err
		}
		if valueToValidate == "" {
			return nil
		}

		//
		// 2. Get the location_type value

		locationType, err := queries.Field(rowCtx.Source, "location_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the location_type is 1 (Station)

		if locationType != "1" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
