package fare_rules

import (
	"main/i18n"
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
	s := types.SEVERITY_IGNORE
	if rules != nil && rules.RouteId.Severity != "" {
		s = rules.RouteId.Severity
	}

	if fareRule.RouteId == nil {
		// route_id is optional, so nothing to validate if not present
		return
	}

	addMessage := func(msg string, severity types.Severity) {
		services.AppMessageService.AddMessage(types.Message{
			Field:    "route_id",
			FileName: "fare_rules.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: severity,
			RuleID:   "fare_rule_route_id_references_routes",
		})
	}

	if s == types.SEVERITY_FORBIDDEN {
		addMessage(i18n.AppTranslator.Get("route_id_validation.forbidden"), s)
		return
	}

	// Check Foreign Key
	if !lib.GtfsIdMapKeyExists(gtfs, "routes", *fareRule.RouteId) {
		addMessage(i18n.AppTranslator.Get("route_id_validation.invalid"), types.SEVERITY_ERROR)
		return
	}
}
