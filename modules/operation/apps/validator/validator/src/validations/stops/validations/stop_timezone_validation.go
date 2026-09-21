/*
# Attributes

 - File: [stops.txt]
 - Field: stop_timezone
 - Presence: Optional
 - Type: Timezone

# Description

Timezone of the location.

If the location has a parent station, it inherits the parent station's timezone instead of applying its own.

Stations and parentless stops with empty stop_timezone inherit the timezone specified by `agency.agency_timezone`.

The times provided in stop_times.txt are in the timezone specified by `agency.agency_timezone`, not stop_timezone. This ensures that the time values in a trip always increase over the course of a trip, regardless of which timezones the trip crosses.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/

package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

// StopTimezoneValidation validates the stop_timezone field in stops.txt
func StopTimezoneValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_timezone", "stops.txt", "stop_timezone_valid", row, services.AppMessageService)
	if rules != nil && rules.StopTimezone.Severity != "" {
		ctx.WithSeverity(rules.StopTimezone.Severity)
	}

	if stop.StopTimezone == nil || *stop.StopTimezone == "" {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("stop_timezone_validation.required", "stop_timezone_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_timezone_validation.forbidden"))
		return
	}

	if !lib.ValidateTimezone(*stop.StopTimezone) {
		ctx.AddError(ctx.GetTranslatedMessage("stop_timezone_validation.invalid", *stop.StopTimezone))
		return
	}

	// Validate rules
	if rules != nil && rules.StopTimezone.Options != nil {
		if slices.Contains(*rules.StopTimezone.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopTimezone.Options, *stop.StopTimezone) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_timezone_validation.not_allowed", *stop.StopTimezone))
			return
		}
	}
}
