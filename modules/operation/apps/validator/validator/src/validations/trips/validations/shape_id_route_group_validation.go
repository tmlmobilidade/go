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
  - Field: shape_id

# Description

Each route_id may have at most two distinct shape_id values.
Trips with the same route_id and direction_id must share one shape_id.
Missing values and invalid directions are handled by their own rules.
*/
func ShapeIdRouteGroupValidation(tripsGroupedByRouteId types.TripGroupedByRouteId, gtfs *types.Gtfs, rules *types.TripsRules) {
	ShapeIdRouteGroupRuleValidation(tripsGroupedByRouteId, gtfs, rules, "")
}

func ShapeIdRouteGroupRuleValidation(tripsGroupedByRouteId types.TripGroupedByRouteId, gtfs *types.Gtfs, rules *types.TripsRules, ruleID string) {
	// 1. Validate tripsGroupedByRouteId is valid
	for routeId, group := range tripsGroupedByRouteId {
		if len(group.Trips) == 0 {
			continue
		}

		// 2. Validate shape_id is valid
		values := make(map[string]bool)
		directionValues := make(map[int]map[string]bool)
		directionRows := make(map[int]int)
		firstRow := -1
		for _, trip := range group.Trips {
			if trip.ShapeId == nil || *trip.ShapeId == "" {
				continue
			}
			if firstRow == -1 {
				firstRow = trip.Row
			}
			values[*trip.ShapeId] = true
			if trip.DirectionId == nil || (*trip.DirectionId != 0 && *trip.DirectionId != 1) {
				continue
			}
			directionId := *trip.DirectionId
			if directionValues[directionId] == nil {
				directionValues[directionId] = make(map[string]bool)
				directionRows[directionId] = trip.Row
			}
			directionValues[directionId][*trip.ShapeId] = true
		}

		// 3. Validate at most two distinct values per route_id.
		if len(values) > 2 && (ruleID == "" || ruleID == "trips_shape_id_max_two_per_route") {
			ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_shape_id_max_two_per_route", firstRow, services.AppMessageService)
			if rules != nil {
				ctx.WithSeverity(rules.ShapeIdMaxTwoPerRoute.Severity)
			}
			if !ctx.ShouldSkip() {
				ids := make([]string, 0, len(values))
				for value := range values {
					ids = append(ids, value)
				}
				sort.Strings(ids)
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("max_two", routeId, "shape_id", len(ids), strings.Join(ids, ", ")))
			}
		}

		// 4. Validate one value per direction within the route_id.
		if ruleID != "" && ruleID != "trips_shape_id_consistent_per_route_direction" {
			continue
		}
		for directionId := 0; directionId <= 1; directionId++ {
			if len(directionValues[directionId]) <= 1 {
				continue
			}
			ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_shape_id_consistent_per_route_direction", directionRows[directionId], services.AppMessageService)
			if rules != nil {
				ctx.WithSeverity(rules.ShapeIdConsistentPerRouteDirection.Severity)
			}
			if ctx.ShouldSkip() {
				continue
			}
			ids := make([]string, 0, len(directionValues[directionId]))
			for value := range directionValues[directionId] {
				ids = append(ids, value)
			}
			sort.Strings(ids)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("inconsistent_direction", routeId, directionId, "shape_id", strings.Join(ids, ", ")))
		}
	}
}
