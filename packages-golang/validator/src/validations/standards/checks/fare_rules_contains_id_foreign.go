package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_rules.txt], [stops.txt]
  - Field: contains_id
  - Presence: Optional
  - Type: Foreign ID referencing stops.zone_id

# Description

Identifies a zone that an itinerary must enter for this fare to apply. When several zones are listed for the fare,
the itinerary must match every listed zone.

Validation: Checks that each non-empty contains_id exists in stops.zone_id. It compares the original text without
trimming whitespace or normalizing letter case. The presence of the referenced value is separate from its format.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func ContainsIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_rules", "stops")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_rules", []string{"contains_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "contains_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty contains_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the stops table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}

		//
		// 4. Check if the contains_id reference exists

		exists, err := queries.Exists(table, "zone_id", value)
		if err != nil {
			return err
		}

		//
		// 5. Report a missing contains_id reference

		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 6. Return success

		return nil
	})
}
