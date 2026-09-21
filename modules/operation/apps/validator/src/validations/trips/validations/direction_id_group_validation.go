package trips

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"sort"
	"strings"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: direction_id
  - Presence: Optional (Required for "Transportes Metropolitanos de Lisboa")
  - Type: Enum

# Description

Validates if direction_id is unique within each pattern_id.
All trips with the same pattern_id must have the same direction_id.
If a pattern_id has trips with different direction_ids, report error.
*/

func DirectionIdGroupValidation(tripsGroupedByPattern types.TripGroupedByPattern, gtfs *types.Gtfs, rules *types.TripsRules) {
	// Group trips by pattern_id and validate direction_id
	for patternId, group := range tripsGroupedByPattern {
		if len(group.Trips) == 0 {
			panic("trips is empty")
		}

		directionIds := make(map[int]bool)
		for _, trip := range group.Trips {
			if trip.DirectionId != nil {
				directionIds[*trip.DirectionId] = true
			}
		}

		if len(directionIds) <= 1 {
			continue
		}

		ids := make([]int, 0, len(directionIds))
		for id := range directionIds {
			ids = append(ids, id)
		}
		sort.Ints(ids)
		parts := make([]string, len(ids))
		for i, id := range ids {
			parts[i] = fmt.Sprintf("%d", id)
		}
		row := group.Trips[0].Row
		ctx := lib.NewValidationContext("direction_id", "trips.txt", "direction_id_consistent_for_all_patterns_in_trips", row, services.AppMessageService)
		if rules != nil && rules.DirectionIdGroup.Severity != "" {
			ctx.WithSeverity(rules.DirectionIdGroup.Severity)
		}
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_id_group_validation.different_direction_ids_in_pattern", patternId, strings.Join(parts, ", ")))
	}
}
