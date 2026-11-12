package validators

func ValidateLatitude(lat float64) bool {
	//

	//
	// 1. Check if the latitude is valid

	if lat < -90 || lat > 90 {
		return false
	}

	//
	// 2. Return true if the latitude is valid

	return true
}