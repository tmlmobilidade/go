package validators

import (
	"strings"
	"time"
	_ "time/tzdata"
)

// ValidateTimezone checks a timezone name against the IANA timezone database.
func ValidateTimezone(value string) bool {
	value = strings.TrimSpace(value)
	if value == "" || value == "Local" || value == "localtime" {
		return false
	}
	_, err := time.LoadLocation(value)
	return err == nil
}
