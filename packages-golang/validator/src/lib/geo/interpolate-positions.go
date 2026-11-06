package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
)

// InterpolatePositions clamps the interpolation ratio to the segment.
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
