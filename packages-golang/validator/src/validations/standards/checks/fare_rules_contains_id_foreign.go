package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: contains_id
  - Presence: Optional
  - Type: Foreign ID referencing [stops.zone_id]

# Description

Identifies the zones that a rider will enter while using a given fare class. Used in some systems to calculate correct fare class.

# Example

If fare class "c" is associated with all travel on the GRT route that passes through zones 5, 6, and 7 the fare_rules.txt would contain these records:

	fare_id,route_id,...,contains_id
	c,GRT,...,5
	c,GRT,...,6
	c,GRT,...,7

Because all contains_id zones must be matched for the fare to apply, an itinerary that passes through zones 5 and 6 but not zone 7 would not have fare class "c". For more detail, see https://code.google.com/p/googletransitdatafeed/wiki/FareExamples in the GoogleTransitDataFeed project wiki.

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[stops.zone_id]: https://gtfs.org/schedule/reference/#stopstxt
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
