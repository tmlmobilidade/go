package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the serviced stop. All stops serviced during a trip must have a record in [stop_times.txt].

Referenced locations must be stops/platforms, i.e. their `stops.location_type` value must be `0` or `empty`. A stop may be serviced multiple times in the same trip, and multiple trips and routes may service the same stop.

On-demand service using stops should be referenced in the sequence in which service is available at those stops.

A data consumer should assume that travel is possible from one stop or location to any stop or location later in the trip, provided that the `pickup/drop_off_type` of each `stop_time` and the time constraints of each `start/end_pickup_drop_off_window` do not forbid it.

Conditionally Required:

  - Required if stop_times.location_group_id AND stop_times.location_id are NOT defined.
  - Forbidden if stop_times.location_group_id or stop_times.location_id are defined.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StopIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs, stopLocationTypeCache map[string]string) {
	ctx := lib.NewValidationContext("stop_id", "stop_times.txt", "stop_times_stop_id_references_stops_table", row, services.AppMessageService)

	// Forbidden if location_group_id or location_id are defined
	if (stopTime.LocationGroupId != nil && *stopTime.LocationGroupId != "") || (stopTime.LocationId != nil && *stopTime.LocationId != "") {
		if stopTime.StopId != nil && *stopTime.StopId != "" {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.forbidden_with_other_ids"))
		}
		return
	}

	// Required if location_group_id AND location_id are NOT defined
	if (stopTime.LocationGroupId == nil || *stopTime.LocationGroupId == "") && (stopTime.LocationId == nil || *stopTime.LocationId == "") {
		if stopTime.StopId == nil || *stopTime.StopId == "" {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.required"))
			return
		}

		// Foreign key check: must reference a valid stop_id from stops.txt
		// Use IdMap cache instead of database query for performance
		if !lib.GtfsIdMapKeyExists(gtfs, "stops", *stopTime.StopId) {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.not_found", *stopTime.StopId))
			return
		}

		// Check location_type is 0 or empty using cache
		locationTypeStr, exists := stopLocationTypeCache[*stopTime.StopId]
		if exists && locationTypeStr != "" && locationTypeStr != "0" {
			ctx.AddError(ctx.GetTranslatedMessage("stop_id_validation.invalid_location_type"))
			return
		}
	}
}
