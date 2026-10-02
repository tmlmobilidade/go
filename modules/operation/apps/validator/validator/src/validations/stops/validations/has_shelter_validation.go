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
  - Field: has_shelter
  - Presence: Optional
  - Type: Enum

# Description

Describes if the stop has a shelter.

- 0 - Not Applicable for this stop
- 1 - Stop has no shelter
- 2 - Has shelter but is in bad condition
- 3 - Has shelter and is in good condition

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/
func HasShelterValidation(stop *types.Stop, row int, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("has_shelter", "stops.txt", "stops_has_shelter_valid_enum", row, services.AppMessageService)
	if rules != nil && rules.HasShelter.Severity != "" {
		ctx.WithSeverity(rules.HasShelter.Severity)
	}

	// 1. Validate has_shelter is present
	if stop.HasShelter == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate has_shelter is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate has_shelter is a valid value
	validValues := []int{0, 1, 2, 3}
	if !slices.Contains(validValues, *stop.HasShelter) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*stop.HasShelter)))
		return
	}

	// 4. Validate Rule options
	if rules != nil && rules.HasShelter.Options != nil {
		if slices.Contains(*rules.HasShelter.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.HasShelter.Options, strconv.Itoa(*stop.HasShelter)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", *stop.HasShelter))
			return
		}
	}
}
