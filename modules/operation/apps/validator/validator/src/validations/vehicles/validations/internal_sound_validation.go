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
  - Field: internal_sound
  - Presence: Required
  - Type: Enum

# Description

Internal sound information (on-board Public Address).

Valid options are:

  - 0 - No
  - 1 - Yes
*/

func InternalSoundValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("internal_sound", "vehicles.txt", "internal_sound_level_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.InternalSound.Severity != "" {
		ctx.WithSeverity(rules.InternalSound.Severity)
	}

	if vehicle.InternalSound == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("internal_sound_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.InternalSound) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("internal_sound_validation.invalid", strconv.Itoa(*vehicle.InternalSound)))
		return
	}

	// Validate rules
	if rules != nil && rules.InternalSound.Options != nil {
		if slices.Contains(*rules.InternalSound.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.InternalSound.Options, strconv.Itoa(*vehicle.InternalSound)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("internal_sound_validation.not_allowed", strconv.Itoa(*vehicle.InternalSound)))
			return
		}
	}
}
