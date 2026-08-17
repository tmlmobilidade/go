package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: kneeling
  - Presence: Required
  - Type: Enum


# Description

Vehicle "kneeling" to reduce entry height.

Valid options are:

  - 0 - No
  - 1 - Yes
  - 2 - Not Applicable
*/

func KneelingValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("kneeling", "vehicles.txt", "kneeling_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Kneeling.Severity != "" {
		ctx.WithSeverity(rules.Kneeling.Severity)
	}

	if vehicle.Kneeling == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("kneeling_validation.required"))
		return
	}

	validOptions := []int{0, 1, 2}
	if !slices.Contains(validOptions, *vehicle.Kneeling) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("kneeling_validation.invalid", strconv.Itoa(*vehicle.Kneeling)))
		return
	}

	// Validate rules
	if rules != nil && rules.Kneeling.Options != nil {
		if slices.Contains(*rules.Kneeling.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.Kneeling.Options, strconv.Itoa(*vehicle.Kneeling)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("kneeling_validation.not_allowed", strconv.Itoa(*vehicle.Kneeling)))
			return
		}
	}
}
