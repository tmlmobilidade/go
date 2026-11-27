package gtfsvalidator_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

// Format helpers reject blanks directly. Field rules decide whether to skip them.
func TestFormatValidatorsRejectBlankValues(t *testing.T) {
	for _, check := range []struct {
		name     string
		validate func(string) bool
	}{
		{"URL", validators.ValidateURL},
		{"email", validators.ValidateEmail},
		{"language", validators.ValidateLanguage},
		{"phone", validators.ValidatePhone},
		{"timezone", validators.ValidateTimezone},
	} {
		for _, value := range []string{"", " \t\n"} {
			if check.validate(value) {
				t.Errorf("%s validator accepted %q", check.name, value)
			}
		}
	}
}
