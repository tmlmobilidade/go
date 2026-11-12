package validators

func ValidateLatitude(lat float64) bool {
	//

	//
	// 1. Require a latitude inside the inclusive range; NaN fails the comparisons

	return lat >= -90 && lat <= 90
}
