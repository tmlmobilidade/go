package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: license_plate
- Presence: Required
- Type: String

# Description

The license plate of the vehicle.

The license plate must be in the format XXXXXX.
*/
func LicensePlateValidation(vehicle *types.Vehicle, row int, gtfs *types.Gtfs, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("license_plate", "vehicles.txt", "license_plate_format_per_market_rules", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.LicensePlate.Severity != "" {
		ctx.WithSeverity(rules.LicensePlate.Severity)
	}

	if ctx.ShouldIgnore() {
		return
	}

	if vehicle.LicensePlate == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("license_plate_validation.required"))
		return
	}

	if !lib.ValidateLicensePlate(*vehicle.LicensePlate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("license_plate_validation.invalid", *vehicle.LicensePlate))
		return
	}

	if gtfs != nil {
		rows, err := gtfs.GetRowsByField("vehicles", "license_plate", *vehicle.LicensePlate)
		if err == nil && len(rows) > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("license_plate_validation.duplicate", *vehicle.LicensePlate))
			return
		}
	}
}
