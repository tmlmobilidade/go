package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestAgencyPhoneField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_phone_field",
		table:         "agency",
		field:         "agency_phone",
		run:           fields.AgencyPhoneField,
		skipForbidden: true,
	})
}
