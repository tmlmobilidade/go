package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestAgencyName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_name_field",
		table:         "agency",
		field:         "agency_name",
		run:           standard.AgencyNameField,
		skipForbidden: true,
	})
}
