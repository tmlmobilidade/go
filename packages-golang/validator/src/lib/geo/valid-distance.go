package geo

import (
	"math"
)

/*
* ValidDistance reports whether an optional recorded distance is finite and
* nonnegative. nil means missing; zero is a valid recorded value. Negative values,
* NaN, and either infinity are invalid. This does not check units, ordering, or
* whether the recorded distance agrees with the shape's geographic length.
 */
func ValidDistance(distance *float64) bool {
	//

	//
	// 1. Check the pointer before dereferencing it; && stops on the first false term.

	return distance != nil && *distance >= 0 && !math.IsNaN(*distance) && !math.IsInf(*distance, 0)
}
