package geo

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
* ShapeDistTraveledToMeters converts a recorded distance using a shape-wide unit
* heuristic. maxInShape is the largest recorded shape_dist_traveled in that shape,
* not the value of the current point or segment.
*
* A maximum below variables.ShapeDistanceKilometersThreshold (currently 800) is
* treated as kilometers; a maximum at or above it is treated as meters. This is
* an assumption, not unit detection: a short shape recorded in meters can also
* fall below the threshold. This helper does not validate the recorded values.
 */
func ShapeDistTraveledToMeters(value float64, maxInShape float64) float64 {
	//

	//
	// 1. Use the same shape maximum for every conversion so all its points and
	// segment differences receive the same scale, including small early values.

	if maxInShape < variables.ShapeDistanceKilometersThreshold {
		return value * 1000 // Convert the assumed kilometers to meters.
	}

	//
	// 2. A maximum equal to the threshold already follows the meters branch.

	return value // Keep the value assumed to be in meters.
}
