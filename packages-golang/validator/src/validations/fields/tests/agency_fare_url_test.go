package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestAgencyFareUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_fare_url_field",
		table:         "agency",
		field:         "agency_fare_url",
		run:           fields.AgencyFareUrlField,
		skipForbidden: true,
	})
}
