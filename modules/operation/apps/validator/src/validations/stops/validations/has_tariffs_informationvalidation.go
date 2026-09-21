package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: has_tariffs_information
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has tariffs information.

- 0 - Not Applicable for this stop
- 1 - Stop has no tariffs information
- 2 - Has tariffs information but is in bad condition
- 3 - Has tariffs information and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasTariffsInformationValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_tariffs_information", "stops.txt", "has_tariffs_information_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasTariffsInformation.Severity != "" {
		ctx.WithSeverity(rules.HasTariffsInformation.Severity)
	}

	if stop.HasTariffsInformation == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("has_tariffs_information_validation.required", "has_tariffs_information_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_tariffs_information_validation.forbidden"))
		return
	}

	// Validate value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasTariffsInformation) {
		ctx.AddError(ctx.GetTranslatedMessage("has_tariffs_information_validation.invalid", *stop.HasTariffsInformation))
		return
	}

	// Validate value based on rules
	if rules != nil && rules.HasTariffsInformation.Options != nil {
		if slices.Contains(*rules.HasTariffsInformation.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasTariffsInformation.Options, strconv.Itoa(*stop.HasTariffsInformation)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("has_tariffs_information_validation.not_allowed", *stop.HasTariffsInformation))
			return
		}
	}
}
