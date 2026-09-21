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
  - Field: onboard_monitor
  - Presence: Required
  - Type: Enum


# Description

On-board monitor.

Valid options are:

  - 0 - No
  - 1 - Yes
*/

func OnboardMonitorValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("onboard_monitor", "vehicles.txt", "onboard_monitor_valid_enum", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.OnboardMonitor.Severity != "" {
		ctx.WithSeverity(rules.OnboardMonitor.Severity)
	}

	if vehicle.OnboardMonitor == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("onboard_monitor_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.OnboardMonitor) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("onboard_monitor_validation.invalid", strconv.Itoa(*vehicle.OnboardMonitor)))
		return
	}

	// Validate rules
	if rules != nil && rules.OnboardMonitor.Options != nil {
		if slices.Contains(*rules.OnboardMonitor.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.OnboardMonitor.Options, strconv.Itoa(*vehicle.OnboardMonitor)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("onboard_monitor_validation.not_allowed", strconv.Itoa(*vehicle.OnboardMonitor)))
			return
		}
	}
}
