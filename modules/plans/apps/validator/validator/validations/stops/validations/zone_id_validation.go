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
 - Field: zone_id
 - Presence: Optional
 - Type: ID

# Description

Identifies the fare zone for a stop. If this record represents a station or station entrance, the `zone_id` is ignored.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/

// ZoneIdValidation validates the zone_id field in stops.txt
func ZoneIdValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("zone_id", "stops.txt", "zone_id_valid", row, services.AppMessageService)
	if rules != nil && rules.ZoneId.Severity != "" {
		ctx.WithSeverity(rules.ZoneId.Severity)
	}

	if stop.ZoneId == nil || *stop.ZoneId == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("zone_id_validation.required", "zone_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("zone_id_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.ZoneId.Options != nil {
		if slices.Contains(*rules.ZoneId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ZoneId.Options, *stop.ZoneId) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("zone_id_validation.not_allowed", *stop.ZoneId))
			return
		}
	}
}
