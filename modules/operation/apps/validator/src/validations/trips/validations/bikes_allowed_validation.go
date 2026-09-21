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
- Field: bikes_allowed
- Presence: Optional
- Type: Enum

# Description

Indicates whether bikes are allowed.

Valid options are:

  - 0 or empty - No bike information for the trip.
  - 1 - Vehicle being used on this particular trip can accommodate at least one bicycle.
  - 2 - No bicycles are allowed on this trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func BikesAllowedValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("bikes_allowed", "trips.txt", "bikes_allowed_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.BikesAllowed.Severity != "" {
		ctx.WithSeverity(rules.BikesAllowed.Severity)
	}

	// 1. Validate bikes_allowed is required
	if trip.BikesAllowed == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("bikes_allowed_validation.required", "bikes_allowed_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bikes_allowed_validation.forbidden"))
		return
	}

	// 2. Validate bikes_allowed is 0 or 1 if it exists
	if trip.BikesAllowed != nil {
		validBikesAllowed := map[int]bool{0: true, 1: true, 2: true}
		if !validBikesAllowed[*trip.BikesAllowed] {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bikes_allowed_validation.invalid"))
			return
		}
	}

	// 3. Validate Rule Options
	if rules != nil && rules.BikesAllowed.Options != nil {
		if slices.Contains(*rules.BikesAllowed.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.BikesAllowed.Options, fmt.Sprintf("%d", *trip.BikesAllowed)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("bikes_allowed_validation.not_allowed", map[string]any{"value": *trip.BikesAllowed}))
			return
		}
	}
}
