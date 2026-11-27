package validators

import (
	"strings"

	"golang.org/x/text/language"
)

// ValidateLanguage reports whether value is a valid BCP 47 language tag.
func ValidateLanguage(value string) bool {
	value = strings.TrimSpace(value)
	if strings.Contains(value, "_") {
		return false
	}
	_, err := language.Parse(value)
	return err == nil
}
