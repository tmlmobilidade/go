package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
Validates consistency between pattern_id and shape_id across trips.
Processes both pattern_id groups and shape_id groups, and reports the most
appropriate error for each inconsistency (avoids duplicate errors).
*/

func ShapeIdGroupValidation(tripsGroupedByPattern types.TripGroupedByPattern, tripsGroupedByShapeId types.TripGroupedByShapeId, gtfs *types.Gtfs, rules *types.TripsRules) {
	reportedPairs := make(map[string]bool)
	key := func(p, s string) string { return p + "|" + s }

	// 1. Process pattern_id groups: find pattern_ids with multiple shape_ids
	for patternId, group := range tripsGroupedByPattern {
		if len(group.Trips) == 0 {
			continue
		}
		shapeIds := make(map[string]bool)
		for _, trip := range group.Trips {
			if trip.ShapeId != nil {
				shapeIds[*trip.ShapeId] = true
			}
		}
		if len(shapeIds) <= 1 {
			continue
		}
		row := group.Trips[0].Row
		ctx := lib.NewValidationContext("shape_id", "trips.txt", "one_shape_id_per_pattern_id_group", row, services.AppMessageService)
		if rules != nil && rules.OneShapeIdPerPatternIdGroup.Severity != "" {
			ctx.WithSeverity(rules.OneShapeIdPerPatternIdGroup.Severity)
		}
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_group_validation.different_shape_id", patternId))
		for _, trip := range group.Trips {
			if trip.ShapeId != nil {
				reportedPairs[key(patternId, *trip.ShapeId)] = true
			}
		}
	}

	// 2. Process shape_id groups: find shape_ids with multiple pattern_ids (only if not already reported)
	for shapeId, group := range tripsGroupedByShapeId {
		if len(group.Trips) == 0 {
			continue
		}
		patternIds := make(map[string]bool)
		for _, trip := range group.Trips {
			if trip.PatternId != nil {
				patternIds[*trip.PatternId] = true
			}
		}
		if len(patternIds) <= 1 {
			continue
		}
		alreadyReported := false
		for _, trip := range group.Trips {
			if trip.PatternId != nil && reportedPairs[key(*trip.PatternId, shapeId)] {
				alreadyReported = true
				break
			}
		}
		if alreadyReported {
			continue
		}
		row := group.Trips[0].Row
		ctx := lib.NewValidationContext("shape_id", "trips.txt", "one_pattern_id_per_shape_id_group", row, services.AppMessageService)
		if rules != nil && rules.OnePatternIdPerShapeIdGroup.Severity != "" {
			ctx.WithSeverity(rules.OnePatternIdPerShapeIdGroup.Severity)
		}
		if ctx.ShouldSkip() {
			return
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_group_validation.multiple_shape_id_in_unique_pattern_id", shapeId))
	}
}
