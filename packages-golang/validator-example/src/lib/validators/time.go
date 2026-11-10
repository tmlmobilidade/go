package validators

import (
	"strconv"
	"strings"
)

func ValidateTime(t string) bool {
	//

	//
	// 1. Check if the time is valid

	if len(t) != 8 {
		return false
	}

	//
	// 2. Split the time and check if it is valid

	splits := strings.Split(t, ":")
	if len(splits) != 3 {
		return false
	}

	//
	// 3. Check if all splits are numbers

	for _, split := range splits {
		if _, err := strconv.Atoi(split); err != nil {
			return false
		}
	}

	//
	// 4. Return true if the time is valid

	return true
}