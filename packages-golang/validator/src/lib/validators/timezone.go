package validators

import (
	"time"
)

func ValidateTimezone(timezone string) bool {
	//

	//
	// 1. Load the timezone and check if it is valid

	_, err := time.LoadLocation(timezone)
	if err != nil {
		return false
	}

	//
	// 2. Return true if the timezone is valid

	return true
}
