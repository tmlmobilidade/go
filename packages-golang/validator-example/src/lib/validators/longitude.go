package validators

func ValidateLongitude(lon float64) bool {
	//

	//
	// 1. Check if the longitude is valid

	if lon < -180 || lon > 180 {
		return false
	}

	//
	// 2. Return true if the longitude is valid

	return true
}