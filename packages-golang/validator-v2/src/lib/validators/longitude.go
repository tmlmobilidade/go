package validators

func ValidateLongitude(lon float64) bool {
	return lon >= -180 && lon <= 180
}