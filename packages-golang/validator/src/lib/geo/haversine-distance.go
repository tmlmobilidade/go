package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"math"
)

// HaversineDistance returns the geodesic distance between coordinates in meters.
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

	return 2 * variables.EarthRadiusMeters * math.Atan2(math.Sqrt(h), math.Sqrt(1-h))
}
