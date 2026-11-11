package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: bicycles_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Number of spaces for non-folding bicycles. A value of 0 means that non-folding bicycles cannot be carried.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func BicyclesCapacityField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"bicycles_capacity"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the bicycles_capacity value

		value, err := queries.Field(row.Source, "bicycles_capacity")
		if err != nil {
			return err
		}

		//
		// 3. Check if the bicycles_capacity is required

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
