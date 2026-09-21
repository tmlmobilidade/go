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
  - Field: shelter_code
  - Presence: Optional
  - Type: String

# Description

Shelter code for a stop.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func ShelterCodeValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("shelter_code", "stops.txt", "shelter_code_valid", row, services.AppMessageService)
	if rules != nil && rules.ShelterCode.Severity != "" {
		ctx.WithSeverity(rules.ShelterCode.Severity)
	}

	if stop.ShelterCode == nil || *stop.ShelterCode == "" {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shelter_code_validation.required", "shelter_code_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shelter_code_validation.forbidden"))
		return
	}

	// Validate rules
	if rules != nil && rules.ShelterCode.Options != nil {
		if slices.Contains(*rules.ShelterCode.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ShelterCode.Options, *stop.ShelterCode) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shelter_code_validation.not_allowed", *stop.ShelterCode))
			return
		}
	}
}
