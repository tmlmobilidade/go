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
  - Field: has_stop_sign
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has a stop sign.

- 0 - Not Applicable for this stop
- 1 - Stop has no stop sign
- 2 - Has stop sign but is in bad condition
- 3 - Has stop sign and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasStopSignValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_stop_sign", "stops.txt", "has_stop_sign_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasStopSign.Severity != "" {
		ctx.WithSeverity(rules.HasStopSign.Severity)
	}

	if stop.HasStopSign == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("has_stop_sign_validation.required", "has_stop_sign_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_stop_sign_validation.forbidden"))
		return
	}

	// Validate value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasStopSign) {
		ctx.AddError(ctx.GetTranslatedMessage("has_stop_sign_validation.invalid", *stop.HasStopSign))
		return
	}

	// Validate Rule options
	if rules != nil && rules.HasStopSign.Options != nil {
		if slices.Contains(*rules.HasStopSign.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasStopSign.Options, strconv.Itoa(*stop.HasStopSign)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_stop_sign_validation.not_allowed", *stop.HasStopSign))
			return
		}
	}
}
