package validators

import (
	"strconv"
	"strings"
)

// ValidateInteger checks that a base-ten value is a non-negative integer.
func ValidateInteger(value string) bool {
	number, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
	return err == nil && number >= 0
}
