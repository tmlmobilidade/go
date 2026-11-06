package validators

func ValidateLatitude(lat float64) bool {
	return lat >= -90 && lat <= 90
}