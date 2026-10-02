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
	ctx := lib.NewValidationContext("municipality_id", "stops.txt", "stops_municipality_id_valid", row, services.AppMessageService)
	if rules != nil && rules.MunicipalityId.Severity != "" {
		ctx.WithSeverity(rules.MunicipalityId.Severity)
	}

	// 1. Validate municipality_id is present
	if stop.MunicipalityId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate municipality_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate Rule options
	if rules != nil && rules.MunicipalityId.Options != nil {
		if slices.Contains(*rules.MunicipalityId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.MunicipalityId.Options, *stop.MunicipalityId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.MunicipalityId))
			return
		}
	}
}
