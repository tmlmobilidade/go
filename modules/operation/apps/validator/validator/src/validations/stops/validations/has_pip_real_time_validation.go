package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: has_pip_real_time
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has a network map.

- 0 - Not Applicable for this stop
- 1 - Has real-time but is in bad condition
- 2 - Has real-time and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasPipRealTimeValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_pip_real_time", "stops.txt", "stops_has_pip_real_time_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasPipRealTime.Severity != "" {
		ctx.WithSeverity(rules.HasPipRealTime.Severity)
	}

	// 1. Validate has_pip_real_time is present
	if stop.HasPipRealTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate has_pip_real_time is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate has_pip_real_time is a valid value
	validValues := []int{0, 1, 2}
	if !slices.Contains(validValues, *stop.HasPipRealTime) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*stop.HasPipRealTime)))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.HasPipRealTime.Options != nil {
		if slices.Contains(*rules.HasPipRealTime.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasPipRealTime.Options, strconv.Itoa(*stop.HasPipRealTime)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.HasPipRealTime))
			return
		}
	}
}
