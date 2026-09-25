package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
- File: [pathways.txt]
- Field: from_stop_id
- Presence: Required
- Type: Foreign ID referencing stops.stop_id

# Description
Identifies the stop where the pathway starts.

Must contain a stop_id that identifies a platform (location_type=0 or empty), entrance/exit (location_type=2), generic node (location_type=3) or boarding area (location_type=4).

Values for stop_id that identify stations (location_type=1), or stops (location_type=0 or empty) with stop_access=1, are forbidden.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt

[stops.stop_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func FromStopIdValidation(pathways *types.Pathways, row int, gtfs *types.Gtfs, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("from_stop_id", "pathways.txt", "pathway_from_stop_id_references_stops_table", row, services.AppMessageService)

	if rules != nil && rules.FromStopId.Severity != "" {
		ctx.WithSeverity(rules.FromStopId.Severity)
	}

	// Required check
	if pathways.FromStopId == nil {
		ctx.AddMessageWithSeverity(
			ctx.GetTranslatedMessage("from_stop_id_validation.required"),
		)
		return
	}

	stopID := *pathways.FromStopId

	// Foreign key check
	stopRows, err := gtfs.GetRowsById("stops", stopID)
	if err != nil || len(stopRows) == 0 {
		ctx.AddError(
			ctx.GetTranslatedMessage("from_stop_id_validation.not_found", stopID),
		)
		return
	}

	stop, err := gtfs.GetStop(stopRows[0])
	if err != nil {
		return
	}

	locationType := 0 // Default when empty
	if stop.LocationType != "" {
		if errMsg := lib.ParseStringToPrimitive(stop.LocationType, &locationType); errMsg != "" {
			ctx.AddError(
				ctx.GetTranslatedMessage("from_stop_id_validation.invalid_location_type_format", stopID),
			)
			return
		}
	}

	// Forbidden: station (1)
	if locationType == 1 {
		ctx.AddError(
			ctx.GetTranslatedMessage("from_stop_id_validation.invalid_location_type_station", stopID, locationType),
		)
		return
	}

	// Allowed: 0, 2, 3, 4
	allowedLocationTypes := map[int]struct{}{0: {}, 2: {}, 3: {}, 4: {}}

	if _, ok := allowedLocationTypes[locationType]; !ok {
		ctx.AddError(
			ctx.GetTranslatedMessage("from_stop_id_validation.invalid_location_type_pathway", stopID, locationType),
		)
		return
	}

	// Only applies when location_type == 0
	if locationType == 0 {
		stopAccess := 0 // Default when empty

		if stop.StopAccess != "" {
			if errMsg := lib.ParseStringToPrimitive(stop.StopAccess, &stopAccess); errMsg != "" {
				ctx.AddError(
					ctx.GetTranslatedMessage("from_stop_id_validation.invalid_stop_access_format", stopID),
				)
				return
			}
		}

		if stopAccess == 1 {
			ctx.AddError(
				ctx.GetTranslatedMessage("from_stop_id_validation.forbidden_stop_access_1", stopID),
			)
			return
		}
	}
}
