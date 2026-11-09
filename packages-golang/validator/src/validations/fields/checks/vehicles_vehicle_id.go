package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: Unique ID

# Description

Unique internal fleet identifier for a vehicle, corresponding to the vehicle identifier used in GTFS Realtime.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehicleIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the vehicle_id value

		value, err := queries.Field(row.Source, "vehicle_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the vehicle_id is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
