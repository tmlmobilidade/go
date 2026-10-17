package trips

import (
	"strconv"

	"main/lib"
	"main/services"
	stops_coordinates "main/services/geo/stops"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Rule ID: trip_path_stop_coordinates_referenced_from_stops
  - Presence: Recommended
  - Type: coordinates

# Description
Validate that every stop served by a trip (via stop_times.txt) lies within
MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS of the trip's shape (shape_id
in trips.txt, geometry in shapes.txt). Distance is measured to the closest
point along the shape's densified line, not just its original points.
*/

func StopCoordinatesByTripIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, tripStopTimesCache map[string][]types.StopTimeRaw, stopsCache map[string]types.StopCoordinatesValidation, stopClosestShapePointsCache map[string]types.StopClosestShapePointsInfo, rules *types.TripsRules) []types.StopCoordinatesValidation {
	ctx := lib.NewValidationContext("stop_id", "stop_times.txt", "trip_path_stop_coordinates_referenced_from_stops", row, services.AppMessageService)
	if rules != nil && rules.StopCoordinatesByTripId.Severity != "" {
		ctx.WithSeverity(rules.StopCoordinatesByTripId.Severity)
	}

	// 1. Load the trip's stop_times, falling back to a direct query if the pre-built cache missed it
	stopTimesRaw, exists := tripStopTimesCache[*trip.TripId]
	if !exists {
		stopTimes, err := gtfs.GetRowsById("stop_times", *trip.TripId)
		if err != nil {
			return []types.StopCoordinatesValidation{}
		}
		for _, row := range stopTimes {
			stopTimeRaw, err := gtfs.GetStopTime(row)
			if err != nil {
				continue
			}
			stopTimesRaw = append(stopTimesRaw, stopTimeRaw)
		}
	}

	// 2. Without a shape there is no path to compare stop coordinates against
	if trip.ShapeId == nil || *trip.ShapeId == "" {
		return []types.StopCoordinatesValidation{}
	}

	// 3. Respect rule configuration (ignored/forbidden severities skip the check entirely)
	if ctx.ShouldSkip() {
		return []types.StopCoordinatesValidation{}
	}

	// 4. Resolve each stop_time to its stop coordinates, once per distinct stop_id on this trip
	stopCoordinates := make([]types.StopCoordinatesValidation, 0)
	seenStops := make(map[string]struct{})

	for _, stopTimeRaw := range stopTimesRaw {
		stopId := stopTimeRaw.StopId
		if _, seen := seenStops[stopId]; seen {
			continue
		}
		seenStops[stopId] = struct{}{}
		stop, ok := stopsCache[stopId]
		if !ok {
			continue
		}
		stopCoordinates = append(stopCoordinates, stop)
	}

	// 5. Look up precomputed violations from cache (keyed by "stop_id|shape_id"); a hit means
	// that stop's distance to this shape already exceeded the allowed threshold
	for _, stop := range stopCoordinates {
		key := stops_coordinates.StopShapeCacheKey(stop.StopId, *trip.ShapeId)
		if info, ok := stopClosestShapePointsCache[key]; ok {
			stopLat, _ := strconv.ParseFloat(stop.StopLat, 64)
			stopLon, _ := strconv.ParseFloat(stop.StopLon, 64)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_distance_to_shape", stopLat, stopLon, stop.StopId, info.ShapeID, info.ClosestShapePtSeq, info.ClosestShapePtLat, info.ClosestShapePtLon, info.DistanceMeters))
		}
	}

	return stopCoordinates
}
