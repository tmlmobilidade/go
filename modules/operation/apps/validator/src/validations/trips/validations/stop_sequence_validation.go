package trips

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"sort"
	"strconv"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_sequence
  - Presence: Required
  - Type: Non-negative Integer

# Description

Order of stops, location groups, or GeoJSON locations for a particular trip. The values must increase along the trip but do not need to be consecutive.

This validation also checks that the same stop_id does not appear consecutively when ordered by stop_sequence (one directly after another) within the same trip.

# Example

The first location on the trip could have a `stop_sequence=1`, the second location on the trip could have a `stop_sequence=23`, the third location could have a `stop_sequence=40`, and so on.

Travel within the same location group or GeoJSON location requires two records in `stop_times.txt` with the same `location_group_id` or `location_id`.

Invalid (when ordered by stop_sequence):
stop_id,stop_sequence
111, 1
222, 2
333, 3
333, 4  <- Error: same stop_id (333) appears consecutively
444, 5

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func StopSequenceValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules, tripStopTimesCache map[string][]types.StopTimeRaw) (stopSequenceHash string) {
	ctx := lib.NewValidationContext("stop_sequence", "stop_times.txt", "stop_sequence_increasing_by_one_along_trip", row, services.AppMessageService)
	if rules != nil && rules.StopSequence.Severity != "" {
		ctx.WithSeverity(rules.StopSequence.Severity)
	}

	if ctx.ShouldSkip() {
		return
	}

	if trip.TripId == nil {
		return
	}

	// Check each trip's stop times for pickup/dropoff windows
	// Use cached stop_times data instead of querying database

	stopSequences := make([]types.StopTime, 0)
	hash := ""

	// Use cached stop_times data if available
	stopTimesRaw, exists := tripStopTimesCache[*trip.TripId]
	if !exists {
		// Fallback to database query if not in cache (shouldn't happen)
		stopTimes, err := gtfs.GetRowsById("stop_times", *trip.TripId)
		if err != nil {
			return
		}
		for _, row := range stopTimes {
			stopTimeRaw, err := gtfs.GetStopTime(row)
			if err != nil {
				continue
			}
			stopTimesRaw = append(stopTimesRaw, stopTimeRaw)
		}
	}

	// Process cached stop_times data
	for _, stopTimeRaw := range stopTimesRaw {
		stopSequence, err := strconv.Atoi(stopTimeRaw.StopSequence)
		if err != nil {
			ctx.AddError(ctx.GetTranslatedMessage("stop_sequence_validation.invalid_sequence"))
			return
		}

		shapeDistTraveled := -1.0
		if stopTimeRaw.ShapeDistTraveled != "" {
			shapeDistTraveled, err = strconv.ParseFloat(stopTimeRaw.ShapeDistTraveled, 64)
			if err != nil {
				ctx.AddError(ctx.GetTranslatedMessage("stop_sequence_validation.invalid_shape_dist"))
				return
			}
		}

		stopId := stopTimeRaw.StopId

		stopSequences = append(stopSequences, types.StopTime{
			StopSequence:      &stopSequence,
			ShapeDistTraveled: &shapeDistTraveled,
			StopId:            &stopId,
		})
	}

	stopSequences = lib.RemoveDuplicates(stopSequences)
	sort.Slice(stopSequences, func(i, j int) bool {
		return *stopSequences[i].StopSequence < *stopSequences[j].StopSequence
	})

	for _, stopSequence := range stopSequences {
		hash += fmt.Sprintf("%s-%v-%v", *stopSequence.StopId, *stopSequence.ShapeDistTraveled, *stopSequence.StopSequence)
	}

	for i, stopSequence := range stopSequences {
		if i > 0 {
			if *stopSequence.StopSequence <= *stopSequences[i-1].StopSequence {
				ctx.AddError(ctx.GetTranslatedMessage("stop_sequence_validation.non_increasing_sequence", *trip.TripId))
				return
			}

			if *stopSequence.ShapeDistTraveled >= 0 && *stopSequences[i-1].ShapeDistTraveled >= 0 {
				if *stopSequence.ShapeDistTraveled < *stopSequences[i-1].ShapeDistTraveled {
					ctx.AddError(ctx.GetTranslatedMessage("stop_sequence_validation.non_increasing_shape_dist", *trip.TripId))
					return
				}
			}

			// Check for consecutive stop_ids (when ordered by stop_sequence)
			// Skip if stop_id is not defined (using location_group_id or location_id instead)
			if stopSequence.StopId != nil && *stopSequence.StopId != "" &&
				stopSequences[i-1].StopId != nil && *stopSequences[i-1].StopId != "" {
				if *stopSequence.StopId == *stopSequences[i-1].StopId {
					ctx.AddError(ctx.GetTranslatedMessage("stop_sequence_validation.consecutive_stop_ids", *stopSequence.StopId, *trip.TripId))
					return
				}
			}
		}
	}

	stopSequenceHash = lib.Hash(hash)
	return
}
