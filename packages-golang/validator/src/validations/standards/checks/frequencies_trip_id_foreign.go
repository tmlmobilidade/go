package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [frequencies.txt], [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies the trip used as the template for this headway interval.

Validation: Checks that each non-empty trip_id exists in trips.trip_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func FrequenciesTripIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "frequencies", "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "frequencies", []string{"trip_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty trip_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the trips table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "trips"}

		//
		// 4. Check if the trip_id reference exists

		exists, err := queries.Exists(table, "trip_id", value)
		if err != nil {
			return err
		}

		//
		// 5. Report a missing trip_id reference

		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_found", value))
		}

		//
		// 6. Return success

		return nil
	})
}
