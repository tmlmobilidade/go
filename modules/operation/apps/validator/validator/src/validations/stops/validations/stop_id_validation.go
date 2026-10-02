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
// func StopIdValidation(stop *types.Stop, row int, gtfs *types.Gtfs, rules *types.StopsRules, stopsData *types.StopsDataCache) {
func StopIdValidation(stop *types.Stop, row int, gtfs *types.Gtfs, rules *types.StopsRules) {
	ctx := lib.NewValidationContext("stop_id", "stops.txt", "stop_id_unique", row, services.AppMessageService)

	// 1. Validate stop_id is present
	if stop.StopId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stop_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate stop_id is unique
	if stop.StopId != nil {
		rows, err := gtfs.GetRowsById("stops", *stop.StopId)
		if err != nil {
			return
		}
		count := len(lib.RemoveDuplicates(rows))

		if count > 1 {
			ctx.AddError(ctx.GetTranslatedMessage("duplicate", *stop.StopId))
			return
		}
	}

	// 4. Validate Rule options
	if rules != nil && rules.StopId.Options != nil {
		if slices.Contains(*rules.StopId.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.StopId.Options, *stop.StopId) {
			ctx.AddError(ctx.GetTranslatedMessage("not_allowed", *stop.StopId))
			return
		}
	}

	// // Check if stop_id exists in stops_data.json (indexed by flags[].stop_id only, not entry._id)
	// ctx = lib.NewValidationContext("stop_id", "stops.txt", "stop_id_exists", row, services.AppMessageService)
	// if rules != nil && rules.StopIdExists.Severity != "" {
	// 	ctx.WithSeverity(rules.StopIdExists.Severity)
	// }
	// if stop.StopId != nil && *stop.StopId != "" && stopsData != nil && len(stopsData.ValidStopIDs) > 0 {
	// 	if _, exists := stopsData.ValidStopIDs[*stop.StopId]; !exists {
	// 		if ctx.ShouldSkip() {
	// 			return
	// 		}

	// 		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stop_id_validation.does_not_exist", *stop.StopId))
	// 		return
	// 	}
	// }
}
