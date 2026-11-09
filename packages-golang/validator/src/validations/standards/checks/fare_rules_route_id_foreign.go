package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: route_id
  - Presence: Optional
  - Type: Foreign ID referencing [routes.route_id]

# Description

Identifies a route associated with the fare class. If several routes with the same fare attributes exist, create a record in fare_rules.txt for each route.

# Example

If fare class "b" is valid on route "TSW" and "TSE", the fare_rules.txt file would contain these records for the fare class:

	fare_id      route_id
	--------------------------------
	b            TSW
	b            TSE

[fare_rules.txt]: https://gtfs.org/schedule/reference/#fare_rulestxt
[routes.route_id]: https://gtfs.org/schedule/reference/#routestxt
*/
func FareRulesRouteIdForeign(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	ready, err := context.RequireTables(ctx, "fare_rules", "routes")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "fare_rules", []string{"route_id"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "route_id")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty route_id values

		if value == "" {
			return nil
		}

		//
		// 3. Get the routes table

		table := &sqliteTypes.SQLiteTable{DB: rowCtx.DB, Name: "routes"}

		//
		// 4. Check if the route_id reference exists

		exists, err := queries.Exists(table, "route_id", value)
		if err != nil {
			return err
		}

		//
		// 5. Report a missing route_id reference

		if !exists {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 6. Return success

		return nil
	})
}
