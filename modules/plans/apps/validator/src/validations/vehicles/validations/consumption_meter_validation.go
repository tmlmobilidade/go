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
  - Field: consumption_meter
  - Presence: Required
  - Type: Enum

# Description

Consumption measurement.

Valid options are:

  - 0 - No
  - 1 - Yes
*/
func ConsumptionMeterValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("consumption_meter", "vehicles.txt", "consumption_meter_valid_format", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.ConsumptionMeter.Severity != "" {
		ctx.WithSeverity(rules.ConsumptionMeter.Severity)
	}

	if vehicle.ConsumptionMeter == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("consumption_meter_validation.required"))
		return
	}

	validOptions := []int{0, 1}
	if !slices.Contains(validOptions, *vehicle.ConsumptionMeter) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("consumption_meter_validation.invalid", strconv.Itoa(*vehicle.ConsumptionMeter)))
		return
	}

	// Validate rules
	if rules != nil && rules.ConsumptionMeter.Options != nil {
		if slices.Contains(*rules.ConsumptionMeter.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.ConsumptionMeter.Options, strconv.Itoa(*vehicle.ConsumptionMeter)) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("consumption_meter_validation.not_allowed", strconv.Itoa(*vehicle.ConsumptionMeter)))
			return
		}
	}
}
