package validators

import "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators/utils"

// IsHexString validates a six-digit hexadecimal color without a leading hash.
func IsHexString(value string) bool {
	if len(value) != 6 {
		return false
	}
	for i := range value {
		if !utils.IsHex(value[i]) {
			return false
		}
	}
	return true
}
