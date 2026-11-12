package validators

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

func ValidatePhone(p string) bool {
	//

	//
	// 1. Trim the phone and check if it is empty

	input := strings.TrimSpace(p)
	if input == "" {
		return false
	}

	//
	// 2. Check if the phone is valid

	// This regex allows:
	// - Digits
	// - Letters (for dialable text like "RIDE")
	// - Punctuation: ()-+ and spaces
	// - But no other characters like @, #, $, descriptive text

	// Check if input matches allowed characters
	if !variables.PhoneRegex.MatchString(input) {
		return false
	}

	//
	// 3. Check if the phone has at least 7 digits

	// (Optional) You could also add rules to ensure at least some digits exist
	digitMatches := variables.PhoneDigitRegex.FindAllString(input, -1)

	//
	// 4. Return true if the phone has at least 7 digits

	return len(digitMatches) >= 7
}
