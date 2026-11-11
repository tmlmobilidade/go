package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_rules.txt], [fare_attributes.txt]
  - Field: fare_id
  - Presence: Required
  - Type: Foreign ID referencing fare_attributes.fare_id

# Description

Identifies the fare class defined in fare_attributes.txt.

Validation: Checks that each non-empty fare_id exists in fare_attributes.fare_id. It compares the original text
without trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its
format. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func FareIdForeign(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_rules", "fare_attributes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_rules", []string{"fare_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "fare_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty fare_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the fare_attributes table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "fare_attributes"}

		//
		// 4. Check if the fare_id reference exists

		exists, err := queries.Exists(table, "fare_id", value)
		if err != nil {
			return err
		}

		//
		// 5. Report a missing fare_id reference

		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 6. Return success

		return nil
	})
}
