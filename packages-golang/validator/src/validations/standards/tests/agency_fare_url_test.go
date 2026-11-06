package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestAgencyFareUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_fare_url_field",
		table:         "agency",
		field:         "agency_fare_url",
		run:           standard.AgencyFareUrlField,
		skipForbidden: true,
	})
}
