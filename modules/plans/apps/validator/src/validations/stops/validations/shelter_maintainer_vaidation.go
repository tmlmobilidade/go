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
	ctx := lib.NewValidationContext("shelter_maintainer", "stops.txt", "shelter_maintainer_valid", row, services.AppMessageService)
	if rules != nil && rules.ShelterMaintainer.Severity != "" {
		ctx.WithSeverity(rules.ShelterMaintainer.Severity)
	}

	if stop.ShelterMaintainer == nil || *stop.ShelterMaintainer == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shelter_maintainer_validation.required", "shelter_maintainer_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shelter_maintainer_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.ShelterMaintainer.Options != nil {
		if slices.Contains(*rules.ShelterMaintainer.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ShelterMaintainer.Options, *stop.ShelterMaintainer) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shelter_maintainer_validation.not_allowed", *stop.ShelterMaintainer))
			return
		}
	}
}
