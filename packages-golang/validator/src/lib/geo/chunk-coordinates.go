package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"math"
)

// ChunkCoordinates densifies a polyline without modifying its source points.
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
