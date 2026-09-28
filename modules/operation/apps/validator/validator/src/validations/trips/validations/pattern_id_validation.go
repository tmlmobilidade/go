package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: trips.txt
  - Field: pattern_id
  - Presence: Required
  - Type: ID

# Description

Pattern to which the trips belongs.
Patterns correspond to the unfolding of the routes by the directions, if more than one (round trip).

Trips with the same pattern_id must have the same route_id, trip_headsign, direction_id, shape_id and the same stop sequence.
*/
func PatternIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", "trips_pattern_id_present_and_references_consistent", row, services.AppMessageService)
	if rules != nil && rules.PatternId.Severity != "" {
		ctx.WithSeverity(rules.PatternId.Severity)
	}

	// 1. Validate pattern_id is required
	if trip.PatternId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("pattern_id_validation.required", "pattern_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate pattern_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pattern_id_validation.forbidden"))
		return
	}

}
