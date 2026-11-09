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

Validation: Requires a non-empty parent_station when the original location_type text is exactly 2, 3 or 4. Other
location types are left to their own checks.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func ParentStationEmptyLocationTypes(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"parent_station", "location_type"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		//
		// 2. Get the location_type value

		locationType, err := queries.Field(rowCtx.Source, "location_type")
		if err != nil {
			return err
		}

		parentStation, err := queries.Field(rowCtx.Source, "parent_station")
		if err != nil {
			return err
		}

		//
		// 3. Check if the location_type is 0 (Stop/Platform)

		// Validate Parent Station for Location Type 2 (Entrance/Exit), 3 (Generic Node), or 4 (Boarding Area)
		if (locationType == "2" || locationType == "3" || locationType == "4") && parentStation == "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "required_location_type"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
