package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: [stop_access, parent_station]
  - Presence: Conditionally Forbidden, Conditionally Required
  - Type: Enum, Foreign ID referencing stops.stop_id

# Description

  - stop_access: Specifies access to a platform: 0 through the station and its entrances or pathways, 1 directly from
    the street network or empty for unspecified access.
  - parent_station: Identifies the parent location. Stops, entrances and generic nodes reference a station; boarding
    areas reference a platform. A station must not itself have a parent_station.

Validation: Reports populated stop_access when parent_station is empty. This check does not resolve the parent
reference or validate the access value.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopAccessForbiddenParentStation(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_access", "parent_station"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		valueToValidate, err := queries.Field(rowCtx.Source, "stop_access")
		if err != nil {
			return err
		}
		if valueToValidate == "" {
			return nil
		}

		//
		// 2. Get the parent_station value

		parentStation, err := queries.Field(rowCtx.Source, "parent_station")
		if err != nil {
			return err
		}

		//
		// 3. Check if the parent_station is empty

		if parentStation == "" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
