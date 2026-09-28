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
  - Presence: Recommended
  - Type: ID

# Description

The `shape_id` must be the same as the `pattern_id`, so that the shape of a trip can be derived from the fields that describe it.

Trips without `shape_id` or `pattern_id` are left alone: there is nothing to compare, and their own rules already report the problem.
*/
func ShapeIdSamePatternIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_shape_id_needs_to_be_the_same_as_pattern_id", row, services.AppMessageService)
	if rules != nil && rules.ShapeIdSamePatternId.Severity != "" {
		ctx.WithSeverity(rules.ShapeIdSamePatternId.Severity)
	}

	// 1. Validate shape_id and pattern_id are required
	if trip.ShapeId == nil || trip.PatternId == nil {
		return
	}

	// 2. Validate shape_id and pattern_id are skipped
	if ctx.ShouldSkip() {
		return
	}

	if *trip.ShapeId != *trip.PatternId {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_same_pattern_id.not_matching", *trip.ShapeId, *trip.PatternId))
	}
}
