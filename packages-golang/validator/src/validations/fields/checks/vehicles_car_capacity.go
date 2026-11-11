package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: car_capacity
  - Presence: Conditionally Required
  - Type: Non-negative integer

# Description

Number of normal-sized passenger cars the vehicle can carry, primarily for ferries. A value of 0 means cars cannot
be carried. Required for operators providing car transport and optional otherwise.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func CarCapacityField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"car_capacity"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the car_capacity value

		value, err := queries.Field(row.Source, "car_capacity")
		if err != nil {
			return err
		}

		//
		// 3. Check if the car_capacity is required

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
