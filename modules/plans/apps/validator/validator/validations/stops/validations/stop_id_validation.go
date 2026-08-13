package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

 - File: [stops.txt]
 - Field: stop_id
 - Presence: Required
 - Type: Unique ID

# Description

Identifies a location: stop/platform, station, entrance/exit, generic node or boarding area (see location_type).

ID must be unique across all stops.stop_id, locations.geojson id, and location_groups.location_group_id values.

[stops.txt]: https://gtfs.org/schedule/reference/#stopstxt
*/

// StopIdValidation validates the presence and uniqueness of stop_id in stops.txt
func StopIdValidation(stop *types.Stop, row int, gtfs *types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_id", "stops.txt", "stop_id_unique", row, services.AppMessageService)

	// Check if stop_id is missing
	if stop.StopId == nil || *stop.StopId == "" {
		ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.required"))
	}

	// Check if stop_id is unique
	if stop.StopId != nil {
		rows, err := gtfs.GetRowsById("stops", *stop.StopId)
		if err != nil {
			return
		}
		count := len(lib.RemoveDuplicates(rows))

		if count > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.duplicate", *stop.StopId))
			return
		}
	}

	// Validate rules
	if rules != nil && rules.StopId.Options != nil {
		if slices.Contains(*rules.StopId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopId.Options, *stop.StopId) {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.not_allowed", *stop.StopId))
			return
		}
	}
}
