package trips

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: direction_id
  - Presence: Optional
  - Type: Enum

# Description

Indicates the direction of travel for a trip.
This field should not be used in routing; it provides a way to separate trips by direction when publishing time tables.

Valid options are:

  - 0 - Travel in one direction (e.g. outbound travel).
  - 1 - Travel in the opposite direction (e.g. inbound travel).

# Example

The `trip_headsign` and `direction_id` fields may be used together to assign a name to travel in each direction for a set of trips. A `trips.txt` file could contain these records for use in time tables:

	trip_id,...,trip_headsign,direction_id
	1234,...,Airport,0
	1505,...,Downtown,1

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func DirectionIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("direction_id", "trips.txt", "direction_id_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.DirectionId.Severity != "" {
		ctx.WithSeverity(rules.DirectionId.Severity)
	}

	// 1. Validate direction_id is required
	if trip.DirectionId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("direction_id_validation.required", "direction_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_id_validation.forbidden"))
		return
	}

	// 2. Validate direction_id is 0 or 1 if it exists
	if trip.DirectionId != nil {
		validDirectionIds := map[int]bool{0: true, 1: true}
		if !validDirectionIds[*trip.DirectionId] {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_id_validation.invalid"))
			return
		}
	}

	// Validate Rule Options
	if rules != nil && rules.DirectionId.Options != nil {
		if slices.Contains(*rules.DirectionId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.DirectionId.Options, fmt.Sprintf("%d", *trip.DirectionId)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("direction_id_validation.not_allowed", map[string]any{"value": *trip.DirectionId}))
			return
		}
	}
}
