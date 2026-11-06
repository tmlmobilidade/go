package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestAgencyId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_id_field",
		table:         "agency",
		field:         "agency_id",
		run:           standard.AgencyAgencyIdField,
		skipForbidden: true,
	})
}
