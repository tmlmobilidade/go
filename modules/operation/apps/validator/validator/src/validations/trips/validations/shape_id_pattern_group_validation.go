package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id

# Description

Validates consistency between pattern_id and shape_id across trips, from both sides:

 1. A pattern_id must not spread its trips over several shape_id.
 2. A shape_id must not be claimed by several pattern_id.

Both describe the same broken pairing, so reporting each one on its own would
name the same inconsistency twice. The pattern_id side reports first and records
the (pattern_id, shape_id) pairs it named in reportedPairs; the shape_id side
stays quiet for any group that touches a pair already reported.

Callers that drive one rule at a time must pass the same reportedPairs map to
both, and run the pattern_id side first, or the suppression has nothing to read.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func ShapeIdPatternGroupValidation(tripsGroupedByPattern types.TripGroupedByPattern, tripsGroupedByShapeId types.TripGroupedByShapeId, gtfs *types.Gtfs, rules *types.GtfsRules) {
	reportedPairs := make(map[string]bool)
	ShapeIdPatternGroupRuleValidation(tripsGroupedByPattern, tripsGroupedByShapeId, gtfs, rules.Rule("trips_one_shape_id_per_pattern_id_group"), "trips_one_shape_id_per_pattern_id_group", reportedPairs)
	ShapeIdPatternGroupRuleValidation(tripsGroupedByPattern, tripsGroupedByShapeId, gtfs, rules.Rule("trips_one_pattern_id_per_shape_id_group"), "trips_one_pattern_id_per_shape_id_group", reportedPairs)
}

// ShapeIdPatternGroupRuleValidation runs the selected rule with its own context.
// reportedPairs carries suppression state between the two rule executions.
func ShapeIdPatternGroupRuleValidation(
	tripsGroupedByPattern types.TripGroupedByPattern,
	tripsGroupedByShapeId types.TripGroupedByShapeId,
	gtfs *types.Gtfs,
	rules *types.RuleContext,
	ruleID string,
	reportedPairs map[string]bool,
) {
	if reportedPairs == nil {
		reportedPairs = make(map[string]bool)
	}
	key := func(p, s string) string { return p + "|" + s }

	// 1. Process pattern_id groups: find pattern_ids with multiple shape_ids
	if ruleID == "trips_one_shape_id_per_pattern_id_group" {
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
			ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_one_shape_id_per_pattern_id_group", row, services.AppMessageService)
			if rules != nil && rules.Severity != "" {
				ctx.WithSeverity(rules.Severity)
			}
			// Nothing was reported, so nothing is suppressed on the shape_id side.
			if ctx.ShouldSkip() {
				continue
			}
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_shape_id", patternId))
			for _, trip := range group.Trips {
				if trip.ShapeId != nil {
					reportedPairs[key(patternId, *trip.ShapeId)] = true
				}
			}
		}
	}

	// 2. Process shape_id groups: find shape_ids with multiple pattern_ids (only if not already reported)
	if ruleID != "trips_one_pattern_id_per_shape_id_group" {
		return
	}
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
		ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_one_pattern_id_per_shape_id_group", row, services.AppMessageService)
		if rules != nil && rules.Severity != "" {
			ctx.WithSeverity(rules.Severity)
		}
		if ctx.ShouldSkip() {
			continue
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("multiple_shape_id_in_unique_pattern_id", shapeId))
	}
}
