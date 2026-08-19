package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_headsign
  - Presence: Optional
  - Type: String

# Description

Text that appears on signage identifying the trip's destination to riders.

This field overrides the default `trips.trip_headsign` when the headsign changes between stops.

If the headsign is displayed for an entire trip, `trips.trip_headsign` should be used instead.

A `stop_headsign` value specified for one `stop_time` does not apply to subsequent `stop_times` in the same trip.

If you want to override the `trip_headsign` for multiple `stop_times` in the same trip, the `stop_headsign` value must be repeated in each `stop_time` row.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StopHeadsignValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("stop_headsign", "stop_times.txt", "stop_headsign_present", row, services.AppMessageService)
	if rules != nil && rules.StopHeadsign.Severity != "" {
		ctx.WithSeverity(rules.StopHeadsign.Severity)
	}

	if stopTime.StopHeadsign == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_headsign_validation.required", "stop_headsign_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_headsign_validation.forbidden"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.StopHeadsign.Options != nil {
		if slices.Contains(*rules.StopHeadsign.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopHeadsign.Options, *stopTime.StopHeadsign) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_headsign_validation.not_allowed", *stopTime.StopHeadsign))
			return
		}
	}
}
