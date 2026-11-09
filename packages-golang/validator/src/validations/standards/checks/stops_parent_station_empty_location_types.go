package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

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
