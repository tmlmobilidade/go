package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: wheelchair_accessible
  - Presence: Required
  - Type: Enum

# Description

Wheelchair accessibility of the vehicle, using the standard trips.wheelchair_accessible values.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehiclesWheelchairAccessibleField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"wheelchair_accessible"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the wheelchair_accessible value

		value, err := queries.Field(row.Source, "wheelchair_accessible")
		if err != nil {
			return err
		}

		//
		// 3. Check if the wheelchair_accessible is required

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
