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
- Presence: optional
- Type: Foreign ID referencing agency.txt

# Description

Agency for the specified route.

[routes.txt]: https://gtfs.org/schedule/reference/#routestxt
*/
func AgencyIdValidation(route *types.Route, row int, gtfs types.Gtfs, rules *types.RoutesRules) {
	ctx := lib.NewValidationContext("agency_id", "routes.txt", "route_agency_id_references_agency_table", row, services.AppMessageService)
	if rules != nil && rules.AgencyId.Severity != "" {
		ctx.WithSeverity(rules.AgencyId.Severity)
	}

	if route.AgencyId != nil && *route.AgencyId != "" {
		if !lib.GtfsIdMapKeyExists(&gtfs, "agency", *route.AgencyId) {
			ctx.AddError(ctx.GetTranslatedMessage("agency_id_validation.not_found", *route.AgencyId))
			return
		}
	}
}
