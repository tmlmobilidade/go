package stops

import (
	"main/lib"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
	"math"
	"strconv"
)

const MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS = 100.0

// Generates a mapping from stop ID to its closest shape point info for all provided stops.
//
// It does so by first processing all shape coordinate slices into densified (chunked) shape representations for fast distance calculations,
// storing them as a cache keyed by shape ID. Then it delegates to buildStopClosestShapePointsDistanceMapFromCache, which
// performs the nearest-neighbor search from each stop point to each associated shape's chunked geometry.
//
// Args:
//
//	stops ([]types.StopCoordinatesValidation): GTFS stop coordinate records (each must include StopId, StopLat, StopLon as strings).
//	stopToShapeIDs (map[string][]string): A mapping from stop IDs to a slice of shape IDs serving that stop.
//	shapeCoordinatesByID (map[string][]types.ShapeCoordinatesValidation): Each shape ID maps to its full coordinate rows
//	  (each must include ShapePtLat, ShapePtLon, and ShapePtSeq as strings).
//
// Returns:
//
//	(map[string]types.StopClosestShapePointsInfo, error): Mapping of StopId → closest shape info (including shape ID, meters to shape, and shape point data).
//	An error is only returned by the downstream cache function, never here.
func BuildStopClosestShapePointsDistanceMap(
	stops []types.StopCoordinatesValidation,
	stopToShapeIDs map[string][]string,
	shapeCoordinatesByID map[string][]types.ShapeCoordinatesValidation,
) (map[string]types.StopClosestShapePointsInfo, error) {
	// Precompute chunked/regularized versions of each shape for fast distance checks.
	chunkedByID := make(map[string]*shapes_coordinates.ShapeChunkedData)
	for shapeID, points := range shapeCoordinatesByID {
		if data := shapes_coordinates.BuildShapeChunkedData(points); data != nil {
			chunkedByID[shapeID] = data
		}
	}

	// Delegate to function that calculates actual minimum distances using the built cache.
	return buildStopClosestShapePointsDistanceMapFromCache(stops, stopToShapeIDs, chunkedByID)
}

// Computes the closest shape point (from provided cache) to each stop.
//
// This function receives a list of stops, a mapping from stop IDs to candidate shape IDs,
// and a precomputed cache of chunked/interpolated shape geometries keyed by shape ID.
// For every stop, it iterates through the associated shape geometries, efficiently searching
// for the closest interpolated ("chunked") shape point. If the minimum computed distance
// between the stop and any associated shape point is greater than or equal to
// MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS, it records the result (including
// the corresponding original shape point matched to the chunked closest point) in the result map.
//
// Args:
//
//	stops ([]types.StopCoordinatesValidation):
//	  Slice of GTFS stop coordinate records (each as StopId, StopLat, StopLon in string form).
//
//	stopToShapeIDs (map[string][]string):
//	  Maps each stop ID to a list of candidate shape IDs that serve it.
//
//	shapeChunkedCache (map[string]*shapes_coordinates.ShapeChunkedData):
//	  Precomputed cache mapping each shape ID to its chunked/interpolated representation for fast distance checking.
//
// Returns:
//
//	(map[string]types.StopClosestShapePointsInfo, error):
//	  For each StopId, stores the closest found shape info if max distance is met, else omits.
//	  No error is ever returned by this function (for interface consistency).
func buildStopClosestShapePointsDistanceMapFromCache(
	stops []types.StopCoordinatesValidation,
	stopToShapeIDs map[string][]string,
	shapeChunkedCache map[string]*shapes_coordinates.ShapeChunkedData,
) (map[string]types.StopClosestShapePointsInfo, error) {
	stopClosestShapePointsDistance := make(map[string]types.StopClosestShapePointsInfo)
	lib.AppLogger.Accent("Building stop closest shape points distance map from cache")

	for _, stop := range stops {
		// Skip stops without an ID
		if stop.StopId == "" {
			continue
		}
		// Skip stops with no associated shapes
		stopShapeIDs, ok := stopToShapeIDs[stop.StopId]
		if !ok || len(stopShapeIDs) == 0 {
			continue
		}

		// Parse stop coordinates (skip if invalid)
		lat, err := strconv.ParseFloat(stop.StopLat, 64)
		if err != nil {
			continue
		}
		lon, err := strconv.ParseFloat(stop.StopLon, 64)
		if err != nil {
			continue
		}

		stopPoint := types.Coordinates{Lat: lat, Lng: lon}
		minDistance := math.MaxFloat64
		closestShapeID := ""
		closestCoord := types.Coordinates{}
		foundDistance := false

		// Search all eligible shapes for this stop for nearest chunked point
		for _, shapeID := range stopShapeIDs {
			data := shapeChunkedCache[shapeID]
			if data == nil {
				continue
			}

			// For each chunked coordinate, compute distance
			for _, coordinate := range data.ChunkedCoordinates {
				distance := lib.HaversineDistance(stopPoint, coordinate)
				if distance < minDistance {
					minDistance = distance
					closestShapeID = shapeID
					closestCoord = coordinate
					foundDistance = true
					// Early exit if below allowed threshold
					if distance < MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS {
						break
					}
				}
			}
			// Early exit to avoid unnecessary extra checks
			if foundDistance && minDistance < MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS {
				break
			}
		}

		// Only record if nearest found distance is at least the minimum required threshold
		if foundDistance {
			if minDistance < MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS {
				continue
			}
			// Match to closest original shape point for reporting
			closestSeq := 0
			closestLat := closestCoord.Lat
			closestLon := closestCoord.Lng
			if data := shapeChunkedCache[closestShapeID]; data != nil {
				closestSeq, closestLat, closestLon = data.FindClosestOriginalPoint(stopPoint)
			}

			stopClosestShapePointsDistance[stop.StopId] = types.StopClosestShapePointsInfo{
				ShapeID:           closestShapeID,
				DistanceMeters:    minDistance,
				ClosestShapePtLat: closestLat,
				ClosestShapePtLon: closestLon,
				ClosestShapePtSeq: closestSeq,
			}
		}
	}
	lib.AppLogger.Accent("Stop closest shape points distance map built")
	return stopClosestShapePointsDistance, nil
}

// StopShapeCacheKey returns a unique string key for the combination of stop ID and shape ID.
func StopShapeCacheKey(stopID, shapeID string) string {
	return stopID + "|" + shapeID
}

// Computes stop-to-shape distance violations for every (stop, shape) pair.
//
// For each stop and each corresponding shape ID in stopToShapeIDs, this function computes the distance from the stop
// to the closest point along the chunked (densified/interpolated) shape geometry (from shapeChunkedCache).
// If that minimum distance EXCEEDS the allowed tolerance (MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS), a record is emitted in the result map.
// The key is "stopID|shapeID" (see StopShapeCacheKey).
// For each such record, we additionally locate the original (not-interpolated) shape point nearest to the stop
// for reporting.
//
// Arguments:
//
//	stops                - GTFS stops (must have StopId, StopLat, StopLon as strings).
//	stopToShapeIDs       - Maps each StopId to a list of eligible shape IDs.
//	shapeChunkedCache    - Map of eligible shapeIDs to their chunked geometry (pointer to ShapeChunkedData).
//
// Returns:
//
//	map[string]types.StopClosestShapePointsInfo
//	  A violation record for each (stop, shape) with excessive distance. Keyed by StopShapeCacheKey(stopID, shapeID).
func BuildStopClosestShapePointsDistanceMapPerStopShape(
	stops []types.StopCoordinatesValidation,
	stopToShapeIDs map[string][]string,
	shapeChunkedCache map[string]*shapes_coordinates.ShapeChunkedData,
) map[string]types.StopClosestShapePointsInfo {
	result := make(map[string]types.StopClosestShapePointsInfo)

	lib.AppLogger.Accent("Building stop-to-shape distance cache (per stop,shape)...")

	for _, stop := range stops {
		// Skip stops with no StopId
		if stop.StopId == "" {
			continue
		}

		// Fetch all shape IDs this stop should be checked against
		stopShapeIDs, ok := stopToShapeIDs[stop.StopId]
		if !ok || len(stopShapeIDs) == 0 {
			continue
		}

		// Parse stop coordinates
		lat, err := strconv.ParseFloat(stop.StopLat, 64)
		if err != nil {
			continue
		}
		lon, err := strconv.ParseFloat(stop.StopLon, 64)
		if err != nil {
			continue
		}
		stopPoint := types.Coordinates{Lat: lat, Lng: lon}

		// For each shape serving this stop:
		for _, shapeID := range stopShapeIDs {
			data := shapeChunkedCache[shapeID]
			if data == nil {
				continue
			}

			minDistance := math.MaxFloat64
			closestCoord := types.Coordinates{}
			foundDistance := false

			// Find the closest (chunked/interpolated) point along the shape
			for _, coordinate := range data.ChunkedCoordinates {
				distance := lib.HaversineDistance(stopPoint, coordinate)
				if distance < minDistance {
					minDistance = distance
					closestCoord = coordinate
					foundDistance = true
					// Early exit if found below threshold
					if distance < MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS {
						break
					}
				}
			}

			// Report if minimum distance is a violation (strictly > allowed threshold)
			if foundDistance && minDistance > MAX_STOP_DISTANCE_TO_CLOSEST_SHAPE_POINT_METERS {
				// Find closest original shape point for reporting
				closestSeq := 0
				closestLat := closestCoord.Lat
				closestLon := closestCoord.Lng
				if data != nil {
					closestSeq, closestLat, closestLon = data.FindClosestOriginalPoint(stopPoint)
				}
				key := StopShapeCacheKey(stop.StopId, shapeID)
				result[key] = types.StopClosestShapePointsInfo{
					ShapeID:           shapeID,
					DistanceMeters:    minDistance,
					ClosestShapePtLat: closestLat,
					ClosestShapePtLon: closestLon,
					ClosestShapePtSeq: closestSeq,
				}
			}
		}
	}

	lib.AppLogger.Accent("Stop-to-shape distance cache built")
	return result
}
