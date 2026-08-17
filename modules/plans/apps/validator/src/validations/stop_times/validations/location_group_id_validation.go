package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: location_group_id
  - Presence: Conditionally Forbidden
  - Type: Foreign ID referencing location_groups.location_group_id

# Description

Identifies the serviced location group that indicates groups of stops where riders may request pickup or drop off. All location groups serviced during a trip must have a record in stop_times.txt. Multiple trips and routes may service the same location group.

On-demand service using location groups should be referenced in the sequence in which service is available at those location groups. A data consumer should assume that travel is possible from one stop or location to any stop or location later in the trip, provided that the pickup/drop_off_type of each stop_time and the time constraints of each start/end_pickup_drop_off_window do not forbid it.

Conditionally Forbidden:

  - Forbidden if `stop_times.stop_id` or `stop_times.location_id` are defined.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func LocationGroupIdValidation(stopTime *types.StopTime, row int, gtfs *types.Gtfs) {
	ctx := lib.NewValidationContext("location_group_id", "stop_times.txt", "location_group_id_consistent_with_trip_id_and_stops", row, services.AppMessageService)

	// Forbidden if stop_id or location_id are defined
	if (stopTime.StopId != nil && *stopTime.StopId != "") || (stopTime.LocationId != nil && *stopTime.LocationId != "") {
		if stopTime.LocationGroupId != nil && *stopTime.LocationGroupId != "" {
			ctx.AddError(ctx.GetTranslatedMessage("location_group_id_validation.forbidden_with_other_ids"))
		}
		return
	}

	// If location_group_id is present, check foreign key
	if stopTime.LocationGroupId != nil && *stopTime.LocationGroupId != "" {
		// Check Foreign Key
		if !lib.GtfsIdMapKeyExists(gtfs, "location_groups", *stopTime.LocationGroupId) {
			ctx.AddError(ctx.GetTranslatedMessage("location_group_id_validation.not_found", *stopTime.LocationGroupId))
			return
		}
	}
}
