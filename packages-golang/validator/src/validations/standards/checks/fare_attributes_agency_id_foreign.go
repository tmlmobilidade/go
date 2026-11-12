package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_attributes.txt], [agency.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the agency responsible for the fare.

Conditionally Required:
- Required if multiple agencies are defined in agency.txt.
- Recommended otherwise.

Validation: Checks that each non-empty agency_id exists in agency.agency_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
*/
func FareAttributesAgencyIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_attributes", "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_attributes", []string{"agency_id"}, func(rowCtx *contextTypes.ValidationContext) error {
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
		// 2. Get the agency table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "agency"}

		//
		// 3. Check if the agency_id exists in the agency table

		exists, err := queries.Exists(table, "agency_id", value)
		if err != nil {
			return err
		}
		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
		}

		//
		// 4. Return success

		return nil
	})
}
