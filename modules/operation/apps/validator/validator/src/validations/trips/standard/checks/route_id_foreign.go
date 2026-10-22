package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: route_id
  - Presence: Required
  - Type: Foreign Key referencing routes.route_id

# Description

Identifies a route.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func RouteIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_route_id_references_routes_table"
	ctx := lib.NewValidationContext("route_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("route_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if !db.Routes.Exists("route_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}
	return nil
}
