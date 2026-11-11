package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [vehicles.txt], [agency.txt]
  - Field: agency_id
  - Presence: Optional
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the agency responsible for the vehicle.

Validation: Checks that each non-empty agency_id exists in agency.agency_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

[vehicles.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/vehicles
[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
*/
func VehiclesAgencyIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "vehicles", "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "vehicles", []string{"agency_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "agency_id")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the agency_id is foreign

		referenceExists1, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "agency"}, "agency_id", value)
		if err != nil {
			return err
		}
		if !referenceExists1 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
