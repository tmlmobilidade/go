package standardutils

import (
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
)

// StopTime returns the first usable time in the requested preference order.
// Hours may exceed 23; malformed or absent times remain comparison barriers.
func StopTime(stop validationTypes.TimeSequenceStop, departureFirst bool) (int, string, bool) {
	values := []string{stop.ArrivalTime, stop.DepartureTime}
	if departureFirst {
		values[0], values[1] = values[1], values[0]
	}
	for _, value := range values {
		if !validators.ValidateTime(value) {
			continue
		}
		parts := strings.Split(value, ":")
		if len(parts) != 3 {
			continue
		}
		hours, hErr := strconv.Atoi(parts[0])
		minutes, mErr := strconv.Atoi(parts[1])
		seconds, sErr := strconv.Atoi(parts[2])
		if hErr == nil && mErr == nil && sErr == nil && hours >= 0 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60 {
			return hours*3600 + minutes*60 + seconds, value, true
		}
	}
	return 0, "", false
}
