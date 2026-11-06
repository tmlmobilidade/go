package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestAgencyEmailField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_email_field",
		table:         "agency",
		field:         "agency_email",
		run:           fields.AgencyEmailField,
		skipForbidden: true,
	})
}
