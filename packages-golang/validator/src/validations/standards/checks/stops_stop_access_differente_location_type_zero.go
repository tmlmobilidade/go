package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: [stop_access, location_type]
  - Presence: Conditionally Forbidden, Optional
  - Type: Enum

# Description

  - stop_access: Specifies access to a platform: 0 through the station and its entrances or pathways, 1 directly from
    the street network or empty for unspecified access.
  - location_type: Type of location: 0 or empty for a stop/platform, 1 station, 2 entrance/exit, 3 generic node or 4
    boarding area.

Validation: Allows populated stop_access only when the original location_type text is exactly 0. An empty
location_type is not treated as 0 by this rule.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopAccessDifferenteLocationTypeZero(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_access", "location_type"}, func(rowCtx *context.ValidationContext) error {
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
		// 2. Get the location_type value

		locationType, err := queries.Field(rowCtx.Source, "location_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the location_type is 0

		if locationType != "0" {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "forbidden"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
