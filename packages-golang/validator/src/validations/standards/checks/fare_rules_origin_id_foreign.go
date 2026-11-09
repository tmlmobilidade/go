package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: origin_id
  - Presence: Optional
  - Type: Foreign ID referencing [stops.zone_id]

# Description

Identifies an origin zone. If a fare class has multiple origin zones, create a record in fare_rules.txt for each origin_id.

# Example

If fare class "b" is valid for all travel originating from either zone "2" or zone "8", the fare_rules.txt file would contain these records for the fare class:

	fare_id,...,origin_id
	b,...,2
	b,...,8

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[stops.zone_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func OriginIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_rules", "stops")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_rules", []string{"origin_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "origin_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty origin_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the stops table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "stops"}

		//
		// 4. Check if the origin_id reference exists

		exists, err := queries.Exists(table, "zone_id", value)
		if err != nil {
			return err
		}

		//
		// 5. Report a missing origin_id reference

		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 6. Return success

		return nil
	})
}
