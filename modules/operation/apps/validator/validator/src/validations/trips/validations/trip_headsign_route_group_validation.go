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
  - File: trips.txt
  - Field: trip_headsign

# Description

Each route_id may have at most two distinct trip_headsign values.
Trips with the same route_id and direction_id must share one trip_headsign.
Missing values and invalid directions are handled by their own rules.
*/
func TripHeadsignRouteGroupValidation(tripsGroupedByRouteId types.TripGroupedByRouteId, gtfs *types.Gtfs, rules *types.TripsRules) {
	TripHeadsignRouteGroupRuleValidation(tripsGroupedByRouteId, gtfs, rules, "")
}

func TripHeadsignRouteGroupRuleValidation(tripsGroupedByRouteId types.TripGroupedByRouteId, gtfs *types.Gtfs, rules *types.TripsRules, ruleID string) {
	for routeId, group := range tripsGroupedByRouteId {
		if len(group.Trips) == 0 {
			continue
		}

		values := make(map[string]bool)
		directionValues := make(map[int]map[string]bool)
		directionRows := make(map[int]int)
		firstRow := -1
		for _, trip := range group.Trips {
			if trip.TripHeadsign == nil || *trip.TripHeadsign == "" {
				continue
			}
			if firstRow == -1 {
				firstRow = trip.Row
			}
			values[*trip.TripHeadsign] = true
			if trip.DirectionId == nil || (*trip.DirectionId != 0 && *trip.DirectionId != 1) {
				continue
			}
			directionId := *trip.DirectionId
			if directionValues[directionId] == nil {
				directionValues[directionId] = make(map[string]bool)
				directionRows[directionId] = trip.Row
			}
			directionValues[directionId][*trip.TripHeadsign] = true
		}

		// 1. At most two distinct values per route_id.
		if len(values) > 2 && (ruleID == "" || ruleID == "trip_headsign_max_two_per_route") {
			ctx := lib.NewValidationContext("trip_headsign", "trips.txt", "trip_headsign_max_two_per_route", firstRow, services.AppMessageService)
			if rules != nil {
				ctx.WithSeverity(rules.TripHeadsignMaxTwoPerRoute.Severity)
			}
			if !ctx.ShouldSkip() {
				ids := make([]string, 0, len(values))
				for value := range values {
					ids = append(ids, value)
				}
				sort.Strings(ids)
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_associations_validation.max_two", routeId, "trip_headsign", len(ids), strings.Join(ids, ", ")))
			}
		}

		// 2. One value per direction within the route_id.
		if ruleID != "" && ruleID != "trip_headsign_consistent_per_route_direction" {
			continue
		}
		for directionId := 0; directionId <= 1; directionId++ {
			if len(directionValues[directionId]) <= 1 {
				continue
			}
			ctx := lib.NewValidationContext("trip_headsign", "trips.txt", "trip_headsign_consistent_per_route_direction", directionRows[directionId], services.AppMessageService)
			if rules != nil {
				ctx.WithSeverity(rules.TripHeadsignConsistentPerRouteDirection.Severity)
			}
			if ctx.ShouldSkip() {
				continue
			}
			ids := make([]string, 0, len(directionValues[directionId]))
			for value := range directionValues[directionId] {
				ids = append(ids, value)
			}
			sort.Strings(ids)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("route_associations_validation.inconsistent_direction", routeId, directionId, "trip_headsign", strings.Join(ids, ", ")))
		}
	}
}
