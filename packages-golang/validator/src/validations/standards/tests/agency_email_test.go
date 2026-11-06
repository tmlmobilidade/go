package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestAgencyEmail(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_email_field",
		table:         "agency",
		field:         "agency_email",
		run:           standard.AgencyEmailField,
		skipForbidden: true,
	})
}
