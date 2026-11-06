package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"strconv"
)

// StopShapeDistanceViolation parses one stop before checking its distance to a shape.
func StopShapeDistanceViolation(stop types.StopCoordinatesValidation, shapeID string, data *types.ShapeChunkedData) *types.StopClosestShapePointsInfo {
	if stop.StopId == "" {
		return nil
	}
	lat, err := strconv.ParseFloat(stop.StopLat, 64)
	if err != nil {
		return nil
	}
	lon, err := strconv.ParseFloat(stop.StopLon, 64)
	if err != nil {
		return nil
	}
	return stopShapePointDistanceViolation(types.Coordinates{Lat: lat, Lng: lon}, shapeID, data)
}
