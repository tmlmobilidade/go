package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestAgencyUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_url_field",
		table:         "agency",
		field:         "agency_url",
		run:           standard.AgencyUrlField,
		skipForbidden: true,
	})
}
