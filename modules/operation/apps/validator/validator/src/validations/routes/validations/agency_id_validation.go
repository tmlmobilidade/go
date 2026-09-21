package routes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [routes.txt]
- Field: agency_id
- Presence: Conditionally Required
- Type: Foreign ID referencing agency.txt

# Description

Agency for the specified route.

Conditionally Required:
- Required if multiple agencies are defined in agency.txt.
- Recommended otherwise.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func AgencyIdValidation(route *types.Route, row int, gtfs types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("agency_id", "routes.txt", "route_agency_id_references_agency_table", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	} else {
		ctx.WithSeverity(types.SEVERITY_WARNING)
	}

	numAgencies, err := gtfs.GetTableCount("agency")
	// Fallback to in-memory data if database is not available
	if err != nil {
		numAgencies = len(gtfs.Agency)
	}

	// Check if agency_id exists and is valid
	if route.AgencyId != nil && *route.AgencyId != "" {
		// Check Foreign Key
		if !lib.GtfsIdMapKeyExists(&gtfs, "agency", *route.AgencyId) {
			ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found", *route.AgencyId))
			return
		}
	}

	// Handle required vs recommended cases
	if numAgencies > 1 {
		if route.AgencyId == nil || *route.AgencyId == "" {
			ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.required_multiple_agencies"))
		}
	} else if route.AgencyId == nil && !ctx.ShouldIgnore() {
		message := ctx.GetRequiredMessage("agency_id_validation.required", "agency_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
	}
}
