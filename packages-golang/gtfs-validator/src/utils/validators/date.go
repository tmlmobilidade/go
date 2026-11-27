package validators

import (
	"strings"
	"time"
)

// ValidateDate checks a calendar date in YYYYMMDD format.
func ValidateDate(value string) bool {
	date, err := time.Parse("20060102", strings.TrimSpace(value))
	return err == nil && date.Year() > 0
}
