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
  - Field: parish_id
  - Presence: Optional
  - Type: String

# Description

Parish identifier for a stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func ParishIdValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("parish_id", "stops.txt", "parish_id_valid", row, services.AppMessageService)
	if rules != nil && rules.ParishId.Severity != "" {
		ctx.WithSeverity(rules.ParishId.Severity)
	}

	if stop.ParishId == nil || *stop.ParishId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("parish_id_validation.required", "parish_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("parish_id_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.ParishId.Options != nil {
		if slices.Contains(*rules.ParishId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ParishId.Options, *stop.ParishId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("parish_id_validation.not_allowed", *stop.ParishId))
			return
		}
	}
}
