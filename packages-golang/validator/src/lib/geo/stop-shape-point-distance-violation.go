package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"math"
)

// stopShapePointDistanceViolation reports only distances strictly greater than the limit.
func stopShapePointDistanceViolation(stopPoint types.Coordinates, shapeID string, data *types.ShapeChunkedData) *types.StopClosestShapePointsInfo {
	if data == nil {
		return nil
	}
	minDistance := math.MaxFloat64
	foundDistance := false
	for _, coordinate := range data.ChunkedCoordinates {
		distance := HaversineDistance(stopPoint, coordinate)
		if distance < minDistance {
			minDistance = distance
			foundDistance = true
			if distance < variables.MaxStopDistanceToShapeMeters {
				return nil
			}
		}
	}
	if !foundDistance || minDistance <= variables.MaxStopDistanceToShapeMeters {
		return nil
	}
	seq, lat, lon := FindClosestOriginalPoint(data, stopPoint)
	return &types.StopClosestShapePointsInfo{
		ShapeID:           shapeID,
		DistanceMeters:    minDistance,
		ClosestShapePtLat: lat,
		ClosestShapePtLon: lon,
		ClosestShapePtSeq: seq,
	}
}
