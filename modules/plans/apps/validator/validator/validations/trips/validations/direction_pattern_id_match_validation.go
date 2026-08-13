package trips

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
	"strings"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: direction_id
  - Presence: Required
  - Type: ID

# Description

Ensure the direction_id is consistent with the pattern_id (e.g., pattern_id "1001_0_1" should have direction_id = 0).
*/
func DirectionPatternIdMatchValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("direction_pattern_id_match", "trips.txt", "direction_id_matches_feed_pattern_direction", row, services.AppMessageService)
	if rules != nil && rules.DirectionPatternIdMatch.Severity != "" {
		ctx.WithSeverity(rules.DirectionPatternIdMatch.Severity)
	}

	if ctx.ShouldSkip() {
		return
	}

	// Handle required fields
	if trip.PatternId == nil || trip.DirectionId == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_pattern_id_match.required"))
		return
	}

	// Split the pattern_id using underscore
	// Must have three parts: routeId, directionId, variant
	patternIdParts := strings.Split(*trip.PatternId, "_")
	if len(patternIdParts) != 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_pattern_id_match.invalid_pattern_id"))
		return
	}

	// Parse the directionId part (second part) as integer
	directionId, err := strconv.Atoi(patternIdParts[1])
	if err != nil || directionId < 0 || directionId > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_pattern_id_match.invalid_direction_id"))
		return
	}

	// Ensure trip.DirectionId matches parsed directionId from patternId
	if *trip.DirectionId != directionId {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_pattern_id_match.not_matching"))
		return
	}
}
