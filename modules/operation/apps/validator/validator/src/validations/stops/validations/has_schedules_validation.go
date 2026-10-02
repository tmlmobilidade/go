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
  - Field: has_schedules
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has schedules.

- 0 - Not Applicable for this stop
- 1 - Stop has no schedules
- 2 - Has schedules but is in bad condition
- 3 - Has schedules and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasSchedulesValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_schedules", "stops.txt", "stops_has_schedules_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasSchedules.Severity != "" {
		ctx.WithSeverity(rules.HasSchedules.Severity)
	}

	// 1. Validate has_schedules is present
	if stop.HasSchedules == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate has_schedules is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate has_schedules is a valid value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasSchedules) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*stop.HasSchedules)))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.HasSchedules.Options != nil {
		if slices.Contains(*rules.HasSchedules.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasSchedules.Options, strconv.Itoa(*stop.HasSchedules)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.HasSchedules))
			return
		}
	}
}
