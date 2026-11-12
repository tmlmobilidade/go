package validators

import (
	"net/mail"
	"strings"
)

func ValidateEmail(email string) bool {
	//

	//
	// 1. Trim the email and check if it is empty

	email = strings.TrimSpace(email)
	if email == "" {
		return false
	}

	//
	// 2. Parse the email and check if it is valid

	_, err := mail.ParseAddress(email)

	//
	// 3. Return true if the email is valid, false otherwise

	return err == nil
}