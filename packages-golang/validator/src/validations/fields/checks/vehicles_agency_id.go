package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: agency_id
  - Presence: Optional
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the agency responsible for the vehicle.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
*/
func VehiclesAgencyIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "vehicles", []string{"agency_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the agency_id value

		value, err := queries.Field(row.Source, "agency_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the agency_id is required

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
