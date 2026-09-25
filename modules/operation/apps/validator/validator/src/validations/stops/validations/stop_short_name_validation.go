/*
# Attributes

 - File: [stops.txt]
 - Field: stop_short_name
 - Presence: Optional
 - Type: String

# Description

The stop_short_name is an optional field that can be used to provide a short name for the stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
[translations.txt]: https://gtfs.org/schedule/reference/#translationstxt
*/

package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

// StopShortNameValidation validates the presence of stop_short_name in stops.txt according to location_type
func StopShortNameValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_short_name", "stops.txt", "stop_short_name_valid", row, services.AppMessageService)
	if rules != nil && rules.StopShortName.Severity != "" {
		ctx.WithSeverity(rules.StopShortName.Severity)
	}

	// 1. Check presence of stop_short_name based on severity
	if stop.StopShortName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_short_name_validation.required", "stop_short_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_short_name_validation.forbidden"))
		return
	}

	// 2. Validate rules
	if rules != nil && rules.StopShortName.Options != nil {
		if slices.Contains(*rules.StopShortName.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopShortName.Options, *stop.StopShortName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_short_name_validation.not_allowed", *stop.StopShortName))
			return
		}
	}
}
