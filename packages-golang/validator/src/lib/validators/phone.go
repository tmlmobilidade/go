package validators

import (
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

func ValidatePhone(p string) bool {
	input := strings.TrimSpace(p)
	if input == "" {
		return false
	}

	// This regex allows:
	// - Digits
	// - Letters (for dialable text like "RIDE")
	// - Punctuation: ()-+ and spaces
	// - But no other characters like @, #, $, descriptive text

	// Check if input matches allowed characters
	if !variables.PhoneRegex.MatchString(input) {
		return false
	}

	// (Optional) You could also add rules to ensure at least some digits exist
	digitMatches := variables.PhoneDigitRegex.FindAllString(input, -1)

	return len(digitMatches) >= 7
}
