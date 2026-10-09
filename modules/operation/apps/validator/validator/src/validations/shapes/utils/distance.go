package utils

import "math"

// ValidDistance reports whether a recorded distance is present, finite and nonnegative.
func ValidDistance(distance *float64) bool {
	return distance != nil && *distance >= 0 && !math.IsNaN(*distance) && !math.IsInf(*distance, 0)
}
