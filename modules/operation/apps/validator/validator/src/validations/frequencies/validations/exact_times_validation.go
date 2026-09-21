package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: exact_times
  - Presence: optional
  - Type: enum

# Description

Indicates whether the headway between vehicles is exactly regular (i.e., there are no variations in headway).

Valid options are:

  - 0 or empty - Frequency-based trips.
  - 1 - Schedule-based trips with the exact same headway throughout the day. In this case the end_time value must be greater than the last desired trip start_time but less than the last desired trip start_time + headway_secs.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func ExactTimesValidation(frequency *types.Frequencies, row int, rules *types.FrequenciesRules) {
	ctx := lib.NewValidationContext("exact_times", "frequencies.txt", "exact_times_zero_when_timed_trip_uses_frequencies", row, services.AppMessageService)
	if rules != nil && rules.ExactTimes.Severity != "" {
		ctx.WithSeverity(rules.ExactTimes.Severity)
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("exact_times_validation.forbidden"))
		return
	}

	validOptions := []int{0, 1}

	if frequency.ExactTimes == nil {
		if ctx.ShouldIgnore() {
			return
		}

		message := ctx.GetRequiredMessage("exact_times_validation.required", "exact_times_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if !slices.Contains(validOptions, *frequency.ExactTimes) {
		ctx.AddError(ctx.GetTranslatedMessage("exact_times_validation.invalid", *frequency.ExactTimes))
		return
	}

	// Validate rules
	if rules != nil && rules.ExactTimes.Options != nil {
		if slices.Contains(*rules.ExactTimes.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ExactTimes.Options, strconv.Itoa(*frequency.ExactTimes)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("exact_times_validation.not_allowed", *frequency.ExactTimes))
			return
		}
	}

}
