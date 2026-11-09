package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_code
  - Presence: Required
  - Type: Unique ID

# Description

Public-facing vehicle identifier, unique within vehicle_type. Use a registration plate for road vehicles, an MMSI
for ferry or maritime services, or the applicable identifier for other modes.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehicleCodeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"vehicle_code"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the vehicle_code value

		value, err := queries.Field(row.Source, "vehicle_code")
		if err != nil {
			return err
		}

		//
		// 3. Check if the vehicle_code is required

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
