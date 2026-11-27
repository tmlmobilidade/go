package validators

import (
	"regexp"
	"strings"
)

// Permit regional punctuation and a dialable suffix such as 503-238-RIDE.
var phonePattern = regexp.MustCompile(`^(?:\+|\(\+)?[0-9(). -]*[0-9][0-9(). -]*(?:[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*)?$`)

// ValidatePhone checks the dialable format of a phone number.
func ValidatePhone(value string) bool {
	return phonePattern.MatchString(strings.TrimSpace(value))
}
