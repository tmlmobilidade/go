package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestAgencyPhone(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_phone_field",
		table:         "agency",
		field:         "agency_phone",
		run:           standard.AgencyPhoneField,
		skipForbidden: true,
	})
}
