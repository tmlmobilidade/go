package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: unique ID

# Description

Uniquely identifies a vehicle within the operator's fleet.
It is used to track the vehicle as it circulates throughout the transport network.
Corresponds to the field in the GTFS-RT specification: FeedMessage › FeedEntity › VehiclePosition › Vehicle in real-time data—serving as the vehicle's internal identifier in the system.
*/
func VehicleIdValidation(vehicle *types.Vehicle, row int, gtfs *types.Gtfs, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("vehicle_id", "vehicles.txt", "vehicle_id_unique", row, services.AppMessageService)
	if rules != nil && rules.VehicleId.Severity != "" {
		ctx.WithSeverity(rules.VehicleId.Severity)
	}

	// 1. Check if vehicle_id is required
	if vehicle.VehicleId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("vehicle_id_validation.required", "vehicle_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if vehicle_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("vehicle_id_validation.forbidden"))
		return
	}

	// 3. Check if vehicle_id is unique
	rows, err := gtfs.GetRowsById("vehicles", *vehicle.VehicleId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("vehicle_id_validation.duplicate", *vehicle.VehicleId))
		return
	}
}
