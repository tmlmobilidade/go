package lib

import (
	"main/types"
	"math"
)

const EARTH_RADIUS_METERS = 6371000.0

// HaversineDistance computes the geodesic distance between two geographic coordinates
// using the Haversine formula. The result is returned in meters.
//
// Args:
//
//	a (types.Coordinates): First coordinate (latitude, longitude in decimal degrees).
//	b (types.Coordinates): Second coordinate (latitude, longitude in decimal degrees).
//
// Returns:
//
//	float64: Distance between a and b in meters.
func HaversineDistance(a types.Coordinates, b types.Coordinates) float64 {
	lat1 := a.Lat * math.Pi / 180
	lon1 := a.Lng * math.Pi / 180
	lat2 := b.Lat * math.Pi / 180
	lon2 := b.Lng * math.Pi / 180

	dLat := lat2 - lat1
	dLon := lon2 - lon1

	sinLat := math.Sin(dLat / 2)
	sinLon := math.Sin(dLon / 2)
	h := sinLat*sinLat + math.Cos(lat1)*math.Cos(lat2)*sinLon*sinLon

	return 2 * EARTH_RADIUS_METERS * math.Atan2(math.Sqrt(h), math.Sqrt(1-h))
}

// ChunkCoordinatess chunks the shapes distances into segments
// ChunkCoordinatess takes a slice of coordinates representing a shape
// and returns a new slice of coordinates with points interpolated at fixed segment lengths.
//
// The function operates by:
//  1. Creating a deep copy of the input coordinates.
//  2. Calculating the cumulative distance at each coordinate along the shape using the Haversine formula.
//  3. Determining how many equally spaced segments (of SEGMENT_LENGTH meters) fit along the route.
//  4. For each segment, interpolating a new point at the appropriate distance between shape points.
//  5. Always including the final coordinate if it is not exactly coincident with the last interpolated point.
//
// This reduces computational effort in downstream validation while preserving granularity
// for maximum allowed stop-to-shape distances.
//
// Args:
//
//	distances ([]types.Coordinates): Input polyline coordinates.
//
// Returns:
//
//	[]types.Coordinates: Densified/interpolated polyline with approximately SEGMENT_LENGTH meter spacing.
func ChunkCoordinates(distances []types.Coordinates, segmentLength float64) []types.Coordinates {
	if len(distances) == 0 {
		return distances
	}

	// Copy input to avoid mutation
	coordinates := make([]types.Coordinates, 0, len(distances))
	for _, distance := range distances {
		coordinates = append(coordinates, types.Coordinates{
			Lat: distance.Lat,
			Lng: distance.Lng,
		})
	}

	// Calculate cumulative distances along the polyline
	cumDist := make([]float64, 0, len(coordinates))
	cumDist = append(cumDist, 0)
	for i := 0; i < len(coordinates)-1; i++ {
		cumDist = append(cumDist, cumDist[i]+HaversineDistance(coordinates[i], coordinates[i+1]))
	}

	totalLength := cumDist[len(cumDist)-1]
	if totalLength == 0 {
		return distances
	}

	// Determine number of nodes: every SEGMENT_LENGTH meters along the total length, plus the final node
	nodeCount := int(math.Floor(totalLength/segmentLength)) + 1
	result := make([]types.Coordinates, 0, nodeCount+1)
	segIdx := 0

	for i := range nodeCount {
		targetDist := segmentLength * float64(i)

		// Advance to the segment containing targetDist
		for segIdx < len(coordinates)-2 && cumDist[segIdx+1] < targetDist {
			segIdx++
		}

		segStart := cumDist[segIdx]
		segEnd := cumDist[segIdx+1]
		ratio := 0.0
		if segEnd > segStart {
			ratio = (targetDist - segStart) / (segEnd - segStart)
		}

		result = append(result, InterpolatePositions(coordinates[segIdx], coordinates[segIdx+1], ratio))
	}

	// Always append the final coordinate if it's not yet included due to segment rounding
	lastCoord := coordinates[len(coordinates)-1]
	lastResult := result[len(result)-1]
	if lastResult.Lat != lastCoord.Lat || lastResult.Lng != lastCoord.Lng {
		result = append(result, lastCoord)
	}

	return result
}

// InterpolatePositions linearly interpolates between two positions at a given ratio (0..1).
// This function is useful for calculating intermediate points along a line segment defined by two positions.
//
// Args:
//
//	a (types.Coordinates): First coordinate (latitude, longitude in decimal degrees).
//	b (types.Coordinates): Second coordinate (latitude, longitude in decimal degrees).
//	ratio (float64): Ratio between 0 and 1 (inclusive).
//
// Returns:
//
//	types.Coordinates: Interpolated coordinate.
func InterpolatePositions(a, b types.Coordinates, ratio float64) types.Coordinates {
	if ratio < 0 {
		ratio = 0
	}
	if ratio > 1 {
		ratio = 1
	}

	return types.Coordinates{
		Lat: a.Lat + (b.Lat-a.Lat)*ratio,
		Lng: a.Lng + (b.Lng-a.Lng)*ratio,
	}
}
