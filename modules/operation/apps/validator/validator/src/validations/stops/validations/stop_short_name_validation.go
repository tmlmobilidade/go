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
	ctx := lib.NewValidationContext("stop_short_name", "stops.txt", "stop_short_name_valid", row, services.AppMessageService, rules)

	// 1. Validate stop_short_name is present
	if stop.StopShortName == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stop_short_name is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate Rule options
	if rules != nil && rules.Rule("stop_short_name_valid").Options != nil {
		if slices.Contains(*rules.Rule("stop_short_name_valid").Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Rule("stop_short_name_valid").Options, *stop.StopShortName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.StopShortName))
			return
		}
	}
}
