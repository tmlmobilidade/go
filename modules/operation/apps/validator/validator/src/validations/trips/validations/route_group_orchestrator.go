package trips

import (
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
)

// ValidateRouteGroups coordinates shape_id and trip_headsign checks per route.
// The rule runner orders checks by their configured dependencies and seeds each
// route with its own row outcomes, so a failed route does not block other routes.
func ValidateRouteGroups(
	tripsGroupedByRouteId types.TripGroupedByRouteId,
	gtfs *types.Gtfs,
	rules *types.TripsRules,
	runner *services.RuleRunner,
	groupStatuses map[string]map[string]ruleset.Status,
) {
	for routeId, group := range tripsGroupedByRouteId {
		routes := types.TripGroupedByRouteId{routeId: group}
		runner.Run(services.RuleActions{
			"trips_shape_id_max_two_per_route": func() {
				ShapeIdRouteGroupRuleValidation(routes, gtfs, rules, "trips_shape_id_max_two_per_route")
			},
			"trips_shape_id_consistent_per_route_direction": func() {
				ShapeIdRouteGroupRuleValidation(routes, gtfs, rules, "trips_shape_id_consistent_per_route_direction")
			},
			"trip_headsign_max_two_per_route": func() {
				TripHeadsignRouteGroupRuleValidation(routes, gtfs, rules, "trip_headsign_max_two_per_route")
			},
			"trip_headsign_consistent_per_route_direction": func() {
				TripHeadsignRouteGroupRuleValidation(routes, gtfs, rules, "trip_headsign_consistent_per_route_direction")
			},
		}, groupStatuses["route/"+routeId])
	}
}
