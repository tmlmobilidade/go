package validators

import (
	"regexp"
	"strings"
)

var scheduleTime = regexp.MustCompile(`^[0-9]+:[0-5][0-9]:[0-5][0-9]$`)

// ValidateTime accepts service day times including hours beyond midnight.
func ValidateTime(value string) bool {
	return scheduleTime.MatchString(strings.TrimSpace(value))
}
