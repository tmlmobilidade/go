package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: Unique ID

# Description

Unique internal fleet identifier for a vehicle, corresponding to the vehicle identifier used in GTFS Realtime.

Validation: Checks that each non-empty vehicle_id occurs only once in vehicles.txt. It compares the original text
without trimming whitespace or normalizing letter case. Empty values are skipped; required-field checks handle
absence.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehicleIdUnique(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "vehicle_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty vehicle_id values

		// Presence belongs to the field check.
		if value == "" {
			return nil
		}

		//
		// 3. Count matching vehicle_id values

		_, count, err := queries.FieldWithCount(rowCtx.Source, "vehicle_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the vehicle_id is unique

		if count > 1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value))
		}

		//
		// 5. Return success

		return nil
	})
}
