package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestAgencyTimezoneField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_timezone_field",
		table:         "agency",
		field:         "agency_timezone",
		run:           fields.AgencyTimezoneField,
		skipForbidden: true,
	})
}
