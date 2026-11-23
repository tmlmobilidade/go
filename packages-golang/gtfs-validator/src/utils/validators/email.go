package validators

import (
	"net/mail"
	"strings"
)

// ValidateEmail checks the syntax of a single email address, with an optional display name.
func ValidateEmail(value string) bool {
	_, err := mail.ParseAddress(strings.TrimSpace(value))
	return err == nil
}
