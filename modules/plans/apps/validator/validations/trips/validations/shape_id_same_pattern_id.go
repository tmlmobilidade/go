package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapeIdSamePatternIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("shape_id", "trips.txt", "shape_id_needs_to_be_the_same_as_pattern_id", row, services.AppMessageService)
	if rules != nil && rules.ShapeIdSamePatternId.Severity != "" {
		ctx.WithSeverity(rules.ShapeIdSamePatternId.Severity)
	}

	if ctx.ShouldSkip() {
		return
	}

	if trip.ShapeId == nil || trip.PatternId == nil {
		return
	}

	if *trip.ShapeId != *trip.PatternId {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_same_pattern_id.not_matching", *trip.ShapeId, *trip.PatternId))
	}
}
