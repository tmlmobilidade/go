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
  - Field: municipality_id
  - Presence: Optional
  - Type: String

# Description

Municipality identifier for a stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func MunicipalityIdValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("municipality_id", "stops.txt", "municipality_id_valid", row, services.AppMessageService)
	if rules != nil && rules.MunicipalityId.Severity != "" {
		ctx.WithSeverity(rules.MunicipalityId.Severity)
	}

	if stop.MunicipalityId == nil || *stop.MunicipalityId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("municipality_id_validation.required", "municipality_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("municipality_id_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.MunicipalityId.Options != nil {
		if slices.Contains(*rules.MunicipalityId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.MunicipalityId.Options, *stop.MunicipalityId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("municipality_id_validation.not_allowed", *stop.MunicipalityId))
			return
		}
	}
}
