package validators

import (
	"strconv"
	"strings"
)

func ValidateTime(t string) bool {
	if len(t) != 8 {
		return false
	}

	splits := strings.Split(t, ":")
	if len(splits) != 3 {
		return false
	}

	// Check if all splits are numbers
	for _, split := range splits {
		if _, err := strconv.Atoi(split); err != nil {
			return false
		}
	}

	return true
}