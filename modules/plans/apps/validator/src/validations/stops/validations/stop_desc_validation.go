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

	if stop.StopDesc == nil || *stop.StopDesc == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_desc_validation.required", "stop_desc_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_desc_validation.forbidden"))
		return
	}

	if stop.StopName != nil && *stop.StopName == *stop.StopDesc {
		ctx.AddWarning(ctx.GetTranslatedMessage("stop_desc_validation.duplicate", *stop.StopDesc, *stop.StopName))
		return
	}

	// Validate rules
	if rules != nil && rules.StopDesc.Options != nil {
		if slices.Contains(*rules.StopDesc.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopDesc.Options, *stop.StopDesc) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_desc_validation.not_allowed", *stop.StopDesc))
			return
		}
	}

}
