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
  - Presence: Optional (Required for "Transportes Metropolitanos de Lisboa")
  - Type: ID

# Description

Pattern to which the trips belongs.
Patterns correspond to the unfolding of the routes by the directions, if more than one (round trip).

Trips with the same pattern_id must have the same route_id, trip_headsign, direction_id, shape_id and the same stop sequence.
*/
func PatternIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) bool {
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", "pattern_id_present_and_references_consistent", row, services.AppMessageService)
	if rules != nil && rules.PatternId.Severity != "" {
		ctx.WithSeverity(rules.PatternId.Severity)
	}

	if trip.PatternId == nil {
		if ctx.ShouldSkip() {
			return false
		}

		message := ctx.GetRequiredMessage("pattern_id_validation.required", "pattern_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return false
	}

	return true
}
