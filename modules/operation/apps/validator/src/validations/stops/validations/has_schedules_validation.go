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
	ctx := lib.NewValidationContext("has_schedules", "stops.txt", "has_schedules_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasSchedules.Severity != "" {
		ctx.WithSeverity(rules.HasSchedules.Severity)
	}

	if stop.HasSchedules == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("has_schedules_validation.required", "has_schedules_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_schedules_validation.forbidden"))
		return
	}

	// Validate value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasSchedules) {
		ctx.AddError(ctx.GetTranslatedMessage("has_schedules_validation.invalid", *stop.HasSchedules))
		return
	}

	// Validate Rule options
	if rules != nil && rules.HasSchedules.Options != nil {
		if slices.Contains(*rules.HasSchedules.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasSchedules.Options, strconv.Itoa(*stop.HasSchedules)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_schedules_validation.not_allowed", *stop.HasSchedules))
			return
		}
	}
}
