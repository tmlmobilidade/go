package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: pattern_id
  - Presence: Recommended
  - Type: ID

# Description

The `pattern_id` must be the same as the `shape_id`, so that the pattern identifier matches the shape referenced by the trip.

Trips without `shape_id` or `pattern_id` are left alone: there is nothing to compare, and their own rules already report the problem.
*/
func PatternIdSameShapeIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", "trips_pattern_id_needs_to_be_the_same_as_shape_id", row, services.AppMessageService)
	if rules != nil && rules.PatternIdSameShapeId.Severity != "" {
		ctx.WithSeverity(rules.PatternIdSameShapeId.Severity)
	}

	// 1. Validate shape_id and pattern_id are required
	if trip.ShapeId == nil || trip.PatternId == nil {
		return
	}

	// 2. Validate shape_id and pattern_id are skipped
	if ctx.ShouldSkip() {
		return
	}

	if *trip.PatternId != *trip.ShapeId {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", *trip.PatternId, *trip.ShapeId))
	}
}
