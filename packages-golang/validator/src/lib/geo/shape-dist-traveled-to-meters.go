package geo

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

// ShapeDistTraveledToMeters retains the feed-wide distance-unit heuristic.
func ShapeDistTraveledToMeters(value float64, maxInShape float64) float64 {
	if maxInShape < variables.ShapeDistanceKilometersThreshold {
		return value * 1000 // km to m
	}
	return value // already in meters
}
