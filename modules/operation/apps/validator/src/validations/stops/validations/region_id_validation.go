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
  - Field: region_id
  - Presence: Optional
  - Type: String

# Description

Region identifier for a stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func RegionIdValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("region_id", "stops.txt", "region_id_valid", row, services.AppMessageService)
	if rules != nil && rules.RegionId.Severity != "" {
		ctx.WithSeverity(rules.RegionId.Severity)
	}

	if stop.RegionId == nil || *stop.RegionId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("region_id_validation.required", "region_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("region_id_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.RegionId.Options != nil {
		if slices.Contains(*rules.RegionId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.RegionId.Options, *stop.RegionId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("region_id_validation.not_allowed", *stop.RegionId))
			return
		}
	}
}
