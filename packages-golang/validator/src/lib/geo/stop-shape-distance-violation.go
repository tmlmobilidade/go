package geo

import (
	"strconv"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
)

/*
* StopShapeDistanceViolation reports a stop farther from a sampled shape than
* variables.MaxStopDistanceToShapeMeters. shapeID labels the report; data must
* already contain that shape's geometry, as this helper does not load any rows.
*
* A nil result means no reportable distance violation, which also covers missing
* stop IDs, unparseable coordinates, or unavailable shape data. It does not prove
* the input is valid: coordinate ranges and finiteness are not checked here.
 */
func StopShapeDistanceViolation(stop types.StopCoordinatesValidation, shapeID string, data *types.ShapeChunkedData) *types.StopClosestShapePointsInfo {
	//

	//
	// 1. Skip stops without an identifier because they cannot be tied to a report row.

	if stop.StopId == "" {
		return nil
	}

	//
	// 2. Convert the imported text fields to latitude and longitude in degrees.
	// Parsing failures belong to the field rules, rather than distance findings.

	lat, err := strconv.ParseFloat(stop.StopLat, 64)
	if err != nil {
		return nil
	}
	lon, err := strconv.ParseFloat(stop.StopLon, 64)
	if err != nil {
		return nil
	}

	//
	// 3. Run the geometric check using the caller's already prepared shape samples.

	return stopShapePointDistanceViolation(types.Coordinates{Lat: lat, Lng: lon}, shapeID, data)
}
