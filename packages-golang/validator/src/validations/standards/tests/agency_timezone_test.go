package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestAgencyTimezone(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_timezone_field",
		table:         "agency",
		field:         "agency_timezone",
		run:           standard.AgencyTimezoneField,
		skipForbidden: true,
	})
}
