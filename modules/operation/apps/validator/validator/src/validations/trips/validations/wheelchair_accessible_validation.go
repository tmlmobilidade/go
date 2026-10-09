package trips

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
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
	ctx := lib.NewValidationContext("wheelchair_accessible", "trips.txt", "trips_wheelchair_accessible_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.WheelchairAccessible.Severity != "" {
		ctx.WithSeverity(rules.WheelchairAccessible.Severity)
	}

	// 1. Empty is valid: no accessibility information is available.
	if trip.WheelchairAccessible == nil {
		return
	}

	// 2. Validate wheelchair_accessible is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate wheelchair_accessible is 0, 1 or 2 if it exists
	if trip.WheelchairAccessible != nil {
		validWheelchairAccessible := []int{0, 1, 2}
		if !slices.Contains(validWheelchairAccessible, *trip.WheelchairAccessible) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*trip.WheelchairAccessible)))
			return
		}
	}

	// 4. Validate Rule Options
	if rules != nil && rules.WheelchairAccessible.Options != nil {
		if slices.Contains(*rules.WheelchairAccessible.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.WheelchairAccessible.Options, fmt.Sprintf("%d", *trip.WheelchairAccessible)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *trip.WheelchairAccessible))
			return
		}
	}
}
