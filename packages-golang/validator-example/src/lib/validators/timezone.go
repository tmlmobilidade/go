package validators

import (
	"time"
)

func ValidateTimezone(timezone string) bool {
	_, err := time.LoadLocation(timezone)
	return err == nil
}