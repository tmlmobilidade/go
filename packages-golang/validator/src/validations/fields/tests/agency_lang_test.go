package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestAgencyLangField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:            "agency_lang_field",
		table:         "agency",
		field:         "agency_lang",
		run:           fields.AgencyLangField,
		skipForbidden: true,
	})
}
