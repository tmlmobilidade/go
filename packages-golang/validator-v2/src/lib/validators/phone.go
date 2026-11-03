package validators

import (
	"regexp"
	"strings"
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
	var validPhonePattern = regexp.MustCompile(`^[0-9A-Za-z\s\-\+$begin:math:text$$end:math:text$]+$`)

	// Check if input matches allowed characters
	if !validPhonePattern.MatchString(input) {
		return false
	}

	// (Optional) You could also add rules to ensure at least some digits exist
	digits := regexp.MustCompile(`[0-9]`)
	digitMatches := digits.FindAllString(input, -1)

	return len(digitMatches) >= 7
}