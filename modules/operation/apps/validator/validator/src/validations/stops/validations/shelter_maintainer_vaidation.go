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
  - Field: shelter_maintainer
  - Presence: Optional
  - Type: String

# Description

Shelter code for a stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func ShelterMaintainerValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("shelter_maintainer", "stops.txt", "stops_shelter_maintainer_valid", row, services.AppMessageService)
	if rules != nil && rules.ShelterMaintainer.Severity != "" {
		ctx.WithSeverity(rules.ShelterMaintainer.Severity)
	}

	// 1. Validate shelter_maintainer is present
	if stop.ShelterMaintainer == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate shelter_maintainer is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate Rule options
	if rules != nil && rules.ShelterMaintainer.Options != nil {
		if slices.Contains(*rules.ShelterMaintainer.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ShelterMaintainer.Options, *stop.ShelterMaintainer) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.ShelterMaintainer))
			return
		}
	}
}
