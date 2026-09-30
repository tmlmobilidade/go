package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: agency_id
- Presence: Required
- Type: Foreign ID referencing agency.txt

# Description

Agency for the specified vehicle.
*/
func AgencyIdValidation(vehicle *types.Vehicle, row int, gtfs *types.Gtfs, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("agency_id", "vehicles.txt", "vehicle_agency_id_references_agency_table", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	}

	// 1. Check if agency_id is required
	if vehicle.AgencyId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("agency_id_validation.required", "agency_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if agency_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_id_validation.forbidden"))
		return
	}

	// 3. Check if agency_id is valid
	rows, err := gtfs.GetRowsById("agency", *vehicle.AgencyId)
	if err == nil && len(rows) == 0 {
		ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found", *vehicle.AgencyId))
		return
	}
}
