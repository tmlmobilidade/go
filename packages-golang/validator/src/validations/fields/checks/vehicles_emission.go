package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: emission
  - Presence: Required
  - Type: Enum

# Description

Emissions class applicable in the vehicle's operating territory. Accepted classes are Euro I through Euro VII, or
N/A when not applicable, such as for electric vehicles.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func EmissionField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"emission"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the emission value

		value, err := queries.Field(row.Source, "emission")
		if err != nil {
			return err
		}

		//
		// 3. Check if the emission is required

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
