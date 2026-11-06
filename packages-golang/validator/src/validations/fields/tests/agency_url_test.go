package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestAgencyUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_url_field",
		table:         "agency",
		field:         "agency_url",
		run:           fields.AgencyUrlField,
		skipForbidden: true,
	})
}
