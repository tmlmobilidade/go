package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestAgencyNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_name_field",
		table:         "agency",
		field:         "agency_name",
		run:           fields.AgencyNameField,
		skipForbidden: true,
	})
}
