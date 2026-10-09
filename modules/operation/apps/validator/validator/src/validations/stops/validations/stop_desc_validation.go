package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_desc
  - Presence: Optional
  - Type: String

# Description

Description of the location that provides useful, quality information. Should not be a duplicate of stop_name.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func StopDescValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_desc", "stops.txt", "stop_desc_valid", row, services.AppMessageService)
	if rules != nil && rules.StopDesc.Severity != "" {
		ctx.WithSeverity(rules.StopDesc.Severity)
	}

	// 1. Validate stop_desc is present
	if stop.StopDesc == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stop_desc is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate stop_desc is not a duplicate of stop_name
	if stop.StopName != nil && *stop.StopName == *stop.StopDesc {
		ctx.AddWarning(ctx.GetTranslatedMessage("duplicate", *stop.StopDesc, *stop.StopName))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.StopDesc.Options != nil {
		if slices.Contains(*rules.StopDesc.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopDesc.Options, *stop.StopDesc) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.StopDesc))
			return
		}
	}

}
