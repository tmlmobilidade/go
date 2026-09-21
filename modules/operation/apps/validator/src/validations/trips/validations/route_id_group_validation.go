package trips

import (
	"main/lib"
	"main/services"
	"main/types"
	"sort"
	"strings"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: route_id
  - Presence: Optional (Required for "Transportes Metropolitanos de Lisboa")
  - Type: ID

# Description

Validates if route_id is unique within each pattern_id.
All trips with the same pattern_id must have the same route_id.
If a pattern_id has trips with different route_ids, report error.
*/

func RouteIdGroupValidation(tripsGroupedByPattern types.TripGroupedByPattern, gtfs *types.Gtfs, rules *types.TripsRules) {
	// Group trips by pattern_id and validate route_id
	for patternId, group := range tripsGroupedByPattern {
		if len(group.Trips) == 0 {
			panic("trips is empty")
		}

		routeIds := make(map[string]bool)
		for _, trip := range group.Trips {
			if trip.RouteId != nil {
				routeIds[*trip.RouteId] = true
			}
		}

		if len(routeIds) <= 1 {
			continue
		}

		ids := make([]string, 0, len(routeIds))
		for id := range routeIds {
			ids = append(ids, id)
		}
		sort.Strings(ids)
		row := group.Trips[0].Row
		ctx := lib.NewValidationContext("route_id", "trips.txt", "route_id_consistent_for_all_patterns_in_trips", row, services.AppMessageService)
		if rules != nil && rules.RouteIdGroup.Severity != "" {
			ctx.WithSeverity(rules.RouteIdGroup.Severity)
		}
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_id_group_validation.different_route_ids_in_pattern", patternId, strings.Join(ids, ", ")))
	}
}
