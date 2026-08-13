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
  - Field: stop_code
  - Presence: Optional
  - Type: String

# Description

Short text or a number that identifies the location for riders.

These codes are often used in phone-based transit information systems or printed on signage to make it easier for riders to get information for a particular location.

The `stop_code` may be the same as `stop_id` if it is public facing.

This field should be left empty for locations without a code presented to riders.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func StopCodeValidation(stop *types.Stop, row int, gtfs *types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_code", "stops.txt", "stop_code_valid", row, services.AppMessageService)
	if rules != nil && rules.StopCode.Severity != "" {
		ctx.WithSeverity(rules.StopCode.Severity)
	}

	if stop.StopCode == nil || *stop.StopCode == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stop_code_validation.required", "stop_code_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_code_validation.forbidden"))
		return
	}

	// Check if stop_code is unique
	if stop.StopCode != nil {
		rows, err := gtfs.GetRowsById("stops", *stop.StopCode)
		if err != nil {
			return
		}
		count := len(lib.RemoveDuplicates(rows))

		if count > 1 {
			ctx.AddWarning(ctx.GetTranslatedMessage("stop_code_validation.duplicate", *stop.StopCode))
			return
		}
	}

	// Validate rules
	if rules != nil && rules.StopCode.Options != nil {
		if slices.Contains(*rules.StopCode.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopCode.Options, *stop.StopCode) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_code_validation.not_allowed", *stop.StopCode))
			return
		}
	}

}
