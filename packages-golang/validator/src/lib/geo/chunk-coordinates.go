package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"math"
)

// ChunkCoordinates resamples an ordered polyline at approximately segmentLength
// meter intervals along its cumulative length, retaining the first and last points.
// Intermediate source vertices are not necessarily retained. This lets distance
// checks inspect samples between the vertices recorded in a shape.
//
// The distances argument contains coordinates in degrees, not numeric distances.
// Coordinates must be valid and segmentLength must be finite and greater than zero.
// The input is never modified. Empty input and paths with zero total length are
// returned unchanged, so those results share the input slice's storage.
func ChunkCoordinates(distances []types.Coordinates, segmentLength float64) []types.Coordinates {
	// 1. An empty path has no first or last point to sample; preserve nil input too.
	if len(distances) == 0 {
		return distances
	}

	// 2. Work with a separate coordinate slice so the caller's points stay intact.
	coordinates := make([]types.Coordinates, 0, len(distances))
	for _, distance := range distances {
		coordinates = append(coordinates, types.Coordinates{
			Lat: distance.Lat,
			Lng: distance.Lng,
		})
	}

	// 3. Store how far each vertex lies from the start, measured along the path.
	// For segment lengths 30m and 40m, cumDist becomes [0, 30, 70]. A 50m sample
	// therefore belongs to the second segment, 20m after its starting vertex.
	cumDist := make([]float64, 0, len(coordinates))
	cumDist = append(cumDist, 0)
	for i := 0; i < len(coordinates)-1; i++ {
		cumDist = append(cumDist, cumDist[i]+HaversineDistance(coordinates[i], coordinates[i+1]))
	}

	// 4. A single point or repeated identical points have no length to resample.
	totalLength := cumDist[len(cumDist)-1]
	if totalLength == 0 {
		return distances
	}

	// 5. Sample at 0, segmentLength, 2*segmentLength, ... up to the total length.
	// Reserve one extra slot for the exact endpoint when a remainder is left.
	nodeCount := int(math.Floor(totalLength/segmentLength)) + 1
	result := make([]types.Coordinates, 0, nodeCount+1)
	segIdx := 0

	for i := range nodeCount {
		targetDist := segmentLength * float64(i)

		// 6. Find the source segment containing this distance from the start.
		// Keep the segment index between samples: both samples and vertices are
		// ordered, so previously visited segments never need to be searched again.
		for segIdx < len(coordinates)-2 && cumDist[segIdx+1] < targetDist {
			segIdx++
		}

		// 7. Convert distance along this segment into an interpolation fraction.
		// In the example above, the fraction is (50-30)/(70-30) = 0.5.
		// A repeated vertex creates a zero-length segment; leave ratio at zero
		// in that case to avoid dividing by zero.
		segStart := cumDist[segIdx]
		segEnd := cumDist[segIdx+1]
		ratio := 0.0
		if segEnd > segStart {
			ratio = (targetDist - segStart) / (segEnd - segStart)
		}

		// 8. Interpolate latitude and longitude for this sample. Distances were
		// measured on a sphere, while this interpolation is linear in degrees,
		// so the spacing is an approximation rather than an exact geodesic step.
		result = append(result, InterpolatePositions(coordinates[segIdx], coordinates[segIdx+1], ratio))
	}

	// 9. Preserve the exact final vertex, including when the last interval is
	// shorter than segmentLength or interpolation rounded the endpoint slightly.
	lastCoord := coordinates[len(coordinates)-1]
	lastResult := result[len(result)-1]
	if lastResult.Lat != lastCoord.Lat || lastResult.Lng != lastCoord.Lng {
		result = append(result, lastCoord)
	}

	return result
}
