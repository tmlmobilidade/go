package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestAgencyAgencyIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_id_field",
		table:         "agency",
		field:         "agency_id",
		run:           fields.AgencyAgencyIdField,
		skipForbidden: true,
	})
}
