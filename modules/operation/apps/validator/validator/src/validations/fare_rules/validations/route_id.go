package fare_rules

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
func RouteIdValidation(fareRule *types.FareRule, row int, gtfs *types.Gtfs, rules *types.FareRulesRules) {
	ctx := lib.NewValidationContext("route_id", "fare_rules.txt", "fare_rule_route_id_references_routes", row, services.AppMessageService)
	if rules != nil && rules.RouteId.Severity != "" {
		ctx.WithSeverity(rules.RouteId.Severity)
	}

	if fareRule.RouteId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("route_id_validation.required", "route_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate route_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_id_validation.forbidden"))
		return
	}

	// 3. Validate route_id is a valid route_id
	if !lib.GtfsIdMapKeyExists(gtfs, "routes", *fareRule.RouteId) {
		ctx.AddError(ctx.GetTranslatedMessage("route_id_validation.invalid", *fareRule.RouteId))
		return
	}
}
