package geo

import (
	"math"
)

// ValidDistance accepts only finite, nonnegative recorded distances.
func ValidDistance(distance *float64) bool {
	return distance != nil && *distance >= 0 && !math.IsNaN(*distance) && !math.IsInf(*distance, 0)
}
