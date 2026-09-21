package stop_times

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: timepoint
  - Presence: Optional
  - Type: Enum

# Description

Indicates if arrival and departure times for a stop are strictly adhered to by the vehicle or if they are instead approximate and/or interpolated times. This field allows a GTFS producer to provide interpolated stop-times, while indicating that the times are approximate.

Valid options are:

  - 0 - Times are considered approximate.
  - 1 - Times are considered exact.

All records of [stop_times.txt] with defined arrival or departure times should have timepoint values populated. If no timepoint values are provided, all times are considered exact.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func TimepointValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("timepoint", "stop_times.txt", "timepoint_valid_gtfs_enum", row, services.AppMessageService)
	if rules != nil && rules.Timepoint.Severity != "" {
		ctx.WithSeverity(rules.Timepoint.Severity)
	}

	if stopTime.Timepoint == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("timepoint_validation.required", "timepoint_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("timepoint_validation.forbidden"))
		return
	}

	tp := *stopTime.Timepoint
	if tp != 0 && tp != 1 {
		ctx.AddError(ctx.GetTranslatedMessage("timepoint_validation.invalid"))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.Timepoint.Options != nil {
		if slices.Contains(*rules.Timepoint.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Timepoint.Options, fmt.Sprintf("%d", tp)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("timepoint_validation.not_allowed", fmt.Sprintf("%d", tp)))
			return
		}
	}
}
