package geo

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
)

// InterpolatePositions returns a position between a and b in latitude/longitude
// degrees. A ratio of 0 selects a, 1 selects b, and 0.5 selects their midpoint.
// A finite ratio outside [0, 1] is clamped to the nearest endpoint.
// This is linear coordinate interpolation, used to sample short shape segments;
// it does not follow a great-circle arc or handle crossing the longitude boundary.
func InterpolatePositions(a, b types.Coordinates, ratio float64) types.Coordinates {
	// 1. Keep the interpolated position between the endpoints instead of
	// extrapolating beyond them when the requested ratio is too small or large.
	if ratio < 0 {
		ratio = 0
	}
	if ratio > 1 {
		ratio = 1
	}

	// 2. Move the same fraction of the latitude and longitude differences from a.
	return types.Coordinates{
		Lat: a.Lat + (b.Lat-a.Lat)*ratio,
		Lng: a.Lng + (b.Lng-a.Lng)*ratio,
	}
}
