// Package trips: precompute helpers warm GTFS data into in-memory structures before the main
// trips.txt iteration in [RunValidations]. Validators receive these caches to avoid repeated
// full-table scans and to compute expensive stop-to-shape geometry checks once per unique pair.
//
// Typical call order (must match [RunValidations]):
//
//  1. [buildTripStopTimesCache] — all stop_times rows grouped by trip_id
//  2. [buildStopsCoordinatesCache] — stop_id → raw StopLat/StopLon strings (first row wins)
//  3. [buildShapeChunkedCacheForTripShapes] — every shape_id referenced by a trip, densified for distance math
//  4. [buildStopClosestShapePointsViolationCache] — violation map keyed by stop_id|shape_id (see [main/services/geo/stops.StopShapeCacheKey])
//
// Error handling: IterateStopTimes / IterateStops / IterateTrips errors are logged; callers still
// get the best-effort map built so far. [buildTripIDToShapeID] ignores iterate errors (same pattern
// as the original inline code).
package trips

import (
	"fmt"
	"main/lib"
	shapes_coordinates "main/services/geo/shapes"
	stops_coordinates "main/services/geo/stops"
	"main/types"
)

// buildTripStopTimesCache walks the feed’s stop_times and groups rows by TripId.
//
// Used by stop_sequence and shape_id validations so each trip does not trigger separate
// stop_times queries (N+1 avoidance).
//
// Rows with an empty TripId are skipped. On iterate failure, logs an error and returns whatever
// was accumulated.
func buildTripStopTimesCache(gtfs types.Gtfs) map[string][]types.StopTimeRaw {
	lib.AppLogger.Debug("Pre-computing stop_times data per trip...")
	cache := make(map[string][]types.StopTimeRaw)
	err := gtfs.IterateStopTimes(func(_ int, raw types.StopTimeRaw) error {
		if raw.TripId == "" {
			return nil
		}
		cache[raw.TripId] = append(cache[raw.TripId], raw)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing trip stop times: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed stop_times for %d trips", len(cache)))
	return cache
}

// buildStopsCoordinatesCache builds stop_id → [main/types.StopCoordinatesValidation] (string lat/lon as in GTFS).
//
// Only the first occurrence of each stop_id is kept. Stops missing id, lat, or lon are skipped.
// The result feeds stop-coordinate validation and the stop-to-shape distance precompute.
func buildStopsCoordinatesCache(gtfs types.Gtfs) map[string]types.StopCoordinatesValidation {
	lib.AppLogger.Debug("Pre-computing stops cache...")
	cache := make(map[string]types.StopCoordinatesValidation)
	err := gtfs.IterateStops(func(_ int, stop types.StopRaw) error {
		if stop.StopId == "" || stop.StopLat == "" || stop.StopLon == "" {
			return nil
		}
		if _, exists := cache[stop.StopId]; !exists {
			cache[stop.StopId] = types.StopCoordinatesValidation{
				StopId:  stop.StopId,
				StopLat: stop.StopLat,
				StopLon: stop.StopLon,
			}
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing stops cache: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed stops cache for %d stops", len(cache)))
	return cache
}

// collectShapeIDsReferencedByTrips returns the set of non-empty ShapeId values appearing in trips.
//
// Used to limit shape loading to geometries that can actually be referenced during validation.
func collectShapeIDsReferencedByTrips(gtfs types.Gtfs) map[string]struct{} {
	ids := make(map[string]struct{})
	err := gtfs.IterateTrips(func(_ int, raw types.TripRaw) error {
		if raw.ShapeId != "" {
			ids[raw.ShapeId] = struct{}{}
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error collecting shape IDs from trips: %v", err))
	}
	return ids
}

// buildShapeChunkedCacheForTripShapes loads each trip-referenced shape via GetShapesByShapeId on [main/types.Gtfs],
// converts rows to [main/types.ShapeCoordinatesValidation], and builds [main/services/geo/shapes.ShapeChunkedData]
// (densified polyline suitable for fast Haversine sampling).
//
// Shape IDs with no rows, load errors, or no valid lat/lon pairs are omitted from the map.
// Keys are the shape_id string from trips/shapes.
func buildShapeChunkedCacheForTripShapes(gtfs types.Gtfs) map[string]*shapes_coordinates.ShapeChunkedData {
	lib.AppLogger.Debug("Pre-computing shape IDs from trips...")
	shapeIDs := collectShapeIDsReferencedByTrips(gtfs)
	lib.AppLogger.Debug(fmt.Sprintf("Pre-loading %d distinct shapes into chunked cache...", len(shapeIDs)))

	cache := make(map[string]*shapes_coordinates.ShapeChunkedData)
	for shapeID := range shapeIDs {
		shapes, err := gtfs.GetShapesByShapeId(shapeID)
		if err != nil || len(shapes) == 0 {
			continue
		}
		coords := make([]types.ShapeCoordinatesValidation, 0, len(shapes))
		for _, shape := range shapes {
			if shape.ShapePtLat == "" || shape.ShapePtLon == "" {
				continue
			}
			coords = append(coords, types.ShapeCoordinatesValidation{
				ShapeId:    shape.ShapeId,
				ShapePtLat: shape.ShapePtLat,
				ShapePtLon: shape.ShapePtLon,
				ShapePtSeq: shape.ShapePtSequence,
			})
		}
		if data := shapes_coordinates.BuildShapeChunkedData(coords); data != nil {
			cache[shapeID] = data
		}
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-loaded %d shapes into chunked cache", len(cache)))
	return cache
}

// buildTripIDToShapeID maps TripId → ShapeId for trips that define both fields.
//
// If the same trip_id appeared multiple times with different shape_ids (invalid feed), the last
// row wins. Iterate errors are not surfaced; the map reflects successfully scanned rows only.
func buildTripIDToShapeID(gtfs types.Gtfs) map[string]string {
	m := make(map[string]string)
	_ = gtfs.IterateTrips(func(_ int, raw types.TripRaw) error {
		if raw.ShapeId != "" && raw.TripId != "" {
			m[raw.TripId] = raw.ShapeId
		}
		return nil
	})
	return m
}

// buildStopClosestShapePointsViolationCache derives every (stop_id, shape_id) pair that occurs
// on the feed (via trip stop_times and each trip’s shape), then delegates to
// [main/services/geo/stops.BuildStopClosestShapePointsDistanceMapPerStopShape] so Haversine work runs
// once per pair instead of inside every trip iteration.
//
// Parameters:
//   - tripStopTimes: output of [buildTripStopTimesCache] (trip_id → stop_times rows)
//   - stopsCache: output of [buildStopsCoordinatesCache]; stops missing here are skipped
//   - shapeChunkedCache: output of [buildShapeChunkedCacheForTripShapes]
//
// Returns only entries where stop-to-shape distance exceeds the threshold enforced by the
// stops geo package (violations map). Keys use [main/services/geo/stops.StopShapeCacheKey].
func buildStopClosestShapePointsViolationCache(
	gtfs types.Gtfs,
	tripStopTimes map[string][]types.StopTimeRaw,
	stopsCache map[string]types.StopCoordinatesValidation,
	shapeChunkedCache map[string]*shapes_coordinates.ShapeChunkedData,
) map[string]types.StopClosestShapePointsInfo {
	lib.AppLogger.Debug("Pre-computing stop-to-shape distance cache...")
	tripToShape := buildTripIDToShapeID(gtfs)

	// stop_id → set of shape_ids that appear on any trip serving this stop
	stopToShapes := make(map[string]map[string]struct{})
	for tripID, stopTimes := range tripStopTimes {
		shapeID := tripToShape[tripID]
		if shapeID == "" {
			continue
		}
		for _, st := range stopTimes {
			if st.StopId == "" {
				continue
			}
			if stopToShapes[st.StopId] == nil {
				stopToShapes[st.StopId] = make(map[string]struct{})
			}
			stopToShapes[st.StopId][shapeID] = struct{}{}
		}
	}

	stopToShapeIDsSlice := make(map[string][]string)
	var stopsForDistance []types.StopCoordinatesValidation
	for stopID, shapeSet := range stopToShapes {
		stop, ok := stopsCache[stopID]
		if !ok {
			continue
		}
		sids := make([]string, 0, len(shapeSet))
		for sid := range shapeSet {
			sids = append(sids, sid)
		}
		stopToShapeIDsSlice[stopID] = sids
		stopsForDistance = append(stopsForDistance, stop)
	}

	result := stops_coordinates.BuildStopClosestShapePointsDistanceMapPerStopShape(
		stopsForDistance, stopToShapeIDsSlice, shapeChunkedCache,
	)
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed stop-to-shape distance cache for %d violations", len(result)))
	return result
}
