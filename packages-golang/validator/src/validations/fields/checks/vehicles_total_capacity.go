package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: total_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Total passenger capacity of the vehicle. A value of 0 means passengers cannot be carried. This legacy TML field is
retained by the validator; the current fleet reference documents seating_capacity and standing_capacity separately.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func TotalCapacityField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"total_capacity"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the total_capacity value

		value, err := queries.Field(row.Source, "total_capacity")
		if err != nil {
			return err
		}

		//
		// 3. Check if the total_capacity is required

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
