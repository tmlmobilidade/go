package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: propulsion
  - Presence: Required
  - Type: Enum

# Description

Principal propulsion technology or energy source. For vehicles using several sources, choose the value best
representing the main propulsion technology.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func PropulsionField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"propulsion"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the propulsion value

		value, err := queries.Field(row.Source, "propulsion")
		if err != nil {
			return err
		}

		//
		// 3. Check if the propulsion is required

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
