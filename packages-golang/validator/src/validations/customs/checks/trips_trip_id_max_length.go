package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required (TML Rule)
  - Type: Foreign Key referencing trips.trip_id

# Description

Ensures the trip_id is less than or equal to 36 characters.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func TripIdMaxLength(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"trip_id_limit_characters", "trip_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the trip_id value

		value, err := queries.Field(rowCtx.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Skip empty trip_id_limit_characters values

		if value == "" {
			return nil
		}

		//
		// 4. Check if the trip_id exceeds the maximum length

		if len(value) > 36 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "too_long"))
		}

		//
		// 5. Return success

		return nil
	})
}
