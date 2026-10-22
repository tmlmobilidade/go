package fare_rules_standard

import (
	"main/lib"
	"main/services"
	"main/types"
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
func RouteIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "fare_rule_route_id_references_routes"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_id", "fare_rules.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_id value

	value, err := db.FareRules.Field("route_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty route_id values

	if value == "" {
		return nil
	}

	//
	// 5. Get the routes table

	table, err := db.Table("routes")
	if err != nil {
		return err
	}

	//
	// 6. Check if the route_id reference exists

	exists, err := table.Exists("route_id", value)
	if err != nil {
		return err
	}

	//
	// 7. Report a missing route_id reference

	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 8. Return success

	return nil
}
