package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"math"
)

// HaversineDistance returns the shortest surface distance between a and b in meters,
// treating Earth as a sphere with radius variables.EarthRadiusMeters.
// Coordinates must be latitude and longitude in degrees; this function does not
// validate their ranges. The result measures direct distance, not distance along a shape.
func HaversineDistance(a types.Coordinates, b types.Coordinates) float64 {
	// 1. Convert degrees to radians, the angle unit expected by Go's trig functions.
	lat1 := a.Lat * math.Pi / 180
	lon1 := a.Lng * math.Pi / 180
	lat2 := b.Lat * math.Pi / 180
	lon2 := b.Lng * math.Pi / 180

	// 2. Measure the change in latitude and longitude between the two positions.
	dLat := lat2 - lat1
	dLon := lon2 - lon1

	// 3. Apply the haversine formula. h is the squared sine of half the angle
	// between the positions, as seen from Earth's center. The cosine terms adjust
	// the longitude contribution because meridians get closer near the poles.
	sinLat := math.Sin(dLat / 2)
	sinLon := math.Sin(dLon / 2)
	h := sinLat*sinLat + math.Cos(lat1)*math.Cos(lat2)*sinLon*sinLon

	// 4. Recover the angle with 2*atan2(sqrt(h), sqrt(1-h)), then multiply by
	// Earth's radius to turn that angle into a surface distance in meters.
	return 2 * variables.EarthRadiusMeters * math.Atan2(math.Sqrt(h), math.Sqrt(1-h))
}
