package validators

import utils "github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/validators"

// IsHexString validates a six-digit hexadecimal color without a leading hash.
func IsHexString(value string) bool {
	//

	//
	// 1. Check if the value is a six-digit hexadecimal color without a leading hash

	if len(value) != 6 {
		return false
	}

	//
	// 2. Check if the value is a valid hexadecimal color

	for i := range value {
		if !utils.IsHex(value[i]) {
			return false
		}
	}

	//
	// 3. Return true if the value is a valid hexadecimal color

	return true
}
