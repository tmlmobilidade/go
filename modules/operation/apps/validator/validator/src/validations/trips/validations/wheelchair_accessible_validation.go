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
- Field: wheelchair_accessible
- Presence: Optional
- Type: Enum

# Description

Indicates wheelchair accessibility. Valid options are:

  - 0 or empty - No accessibility information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.
  - 2 - No riders in wheelchairs can be accommodated on this trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func WheelchairAccessibleValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("wheelchair_accessible", "trips.txt", "wheelchair_accessible_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.WheelchairAccessible.Severity != "" {
		ctx.WithSeverity(rules.WheelchairAccessible.Severity)
	}

	// 1. Validate wheelchair_accessible is required
	if trip.WheelchairAccessible == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("wheelchair_accessible_validation.required", "wheelchair_accessible_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate wheelchair_accessible is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.forbidden"))
		return
	}

	// 3. Validate wheelchair_accessible is 0 or 1 if it exists
	if trip.WheelchairAccessible != nil {
		validWheelchairAccessible := map[int]bool{0: true, 1: true, 2: true}
		if !validWheelchairAccessible[*trip.WheelchairAccessible] {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.invalid"))
			return
		}
	}

	// Validate Rule Options
	if rules != nil && rules.WheelchairAccessible.Options != nil {
		if slices.Contains(*rules.WheelchairAccessible.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.WheelchairAccessible.Options, fmt.Sprintf("%d", *trip.WheelchairAccessible)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("wheelchair_accessible_validation.not_allowed", map[string]any{"value": *trip.WheelchairAccessible}))
			return
		}
	}
}
