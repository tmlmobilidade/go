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

The license plate of the vehicle unit.

The license plate must be in the format XXXXXX. For the ferry transport mode the
MMSI is used instead, a 9 digit identifier starting with 2-7.
*/
func LicensePlateValidation(vehicle *types.Vehicle, row int, gtfs *types.Gtfs, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("license_plate", "vehicles.txt", "vehicles_license_plate_format_per_market_rules", row, services.AppMessageService)
	if rules != nil && rules.LicensePlate.Severity != "" {
		ctx.WithSeverity(rules.LicensePlate.Severity)
	}

	// 1. Check if license_plate is required
	if vehicle.LicensePlate == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("license_plate_validation.required", "license_plate_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if license_plate is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("license_plate_validation.forbidden"))
		return
	}

	// 3. Check if license_plate is valid
	if !lib.ValidateLicensePlate(*vehicle.LicensePlate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("license_plate_validation.invalid", *vehicle.LicensePlate))
		return
	}

	// 4. Check if license_plate is unique
	if gtfs != nil {
		rows, err := gtfs.GetRowsByField("vehicles", "license_plate", *vehicle.LicensePlate)
		if err == nil && len(rows) > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("license_plate_validation.duplicate", *vehicle.LicensePlate))
			return
		}
	}
}
