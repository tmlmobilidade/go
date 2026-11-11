package validators

func ValidateLongitude(lon float64) bool {
	//

	//
	// 1. Require a longitude inside the inclusive range; NaN fails the comparisons

	return lon >= -180 && lon <= 180
}
