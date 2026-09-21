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
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	}

	if vehicle.AgencyId == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_id_validation.required"))
		return
	}

	rows, err := gtfs.GetRowsById("agency", *vehicle.AgencyId)
	if err == nil && len(rows) == 0 {
		ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found", *vehicle.AgencyId))
		return
	}
}
