package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the relevant agency for a fare.

Conditionally Required:
  - Required when the dataset contains data for multiple transit [agencies.txt].
  - Recommended otherwise.

[agencies.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func FareAttributesAgencyIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_attributes", "agency")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_attributes", []string{"agency_id"}, func(rowCtx *context.ValidationContext) error {
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
