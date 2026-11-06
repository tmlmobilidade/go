package geo

import (
	"math"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

/*
* stopShapePointDistanceViolation compares stopPoint with the sampled shape and
* reports only a nearest distance strictly greater than the configured limit.
* Coordinates are in degrees; returned distances are in meters.
*
* This searches discrete samples, rather than projecting the stop onto each
* continuous segment, so it can overestimate distance to the line between samples.
* Missing geometry or no usable sample distance yields nil, as does a stop within
* or exactly on the limit. The reported original vertex identifies a source row;
* its distance need not equal the distance to the nearest interpolated sample.
 */
func stopShapePointDistanceViolation(stopPoint types.Coordinates, shapeID string, data *types.ShapeChunkedData) *types.StopClosestShapePointsInfo {
	//

	//
	// 1. An unavailable shape cannot produce a distance finding.

	if data == nil {
		return nil
	}

	//
	// 2. Scan the samples, retaining the smallest distance found. Track whether
	// any distance was usable so an empty slice does not report MaxFloat64.

	minDistance := math.MaxFloat64
	foundDistance := false
	for _, coordinate := range data.ChunkedCoordinates {
		distance := HaversineDistance(stopPoint, coordinate)
		if distance < minDistance {
			minDistance = distance
			foundDistance = true

			//
			// 3. One sample inside the limit is enough to rule out a violation:
			// the final minimum can only stay the same or get smaller from here.

			if distance < variables.MaxStopDistanceToShapeMeters {
				return nil
			}
		}
	}

	//
	// 4. Include equality here: exactly 100m with the current limit is accepted,
	// even though the early return above only handles distances strictly inside it.

	if !foundDistance || minDistance <= variables.MaxStopDistanceToShapeMeters {
		return nil
	}

	//
	// 5. Only a violation needs an original vertex for diagnostics. Search the
	// source vertices separately because interpolated samples have no input row.

	seq, lat, lon := FindClosestOriginalPoint(data, stopPoint)

	//
	// 6. Keep the measured sample distance, but identify the closest original
	// vertex by its recorded coordinates and shape_pt_sequence.

	return &types.StopClosestShapePointsInfo{
		ShapeID:           shapeID,
		DistanceMeters:    minDistance,
		ClosestShapePtLat: lat,
		ClosestShapePtLon: lon,
		ClosestShapePtSeq: seq,
	}
}
