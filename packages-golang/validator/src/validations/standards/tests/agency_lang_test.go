package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestAgencyLang(t *testing.T) {
	checkPresence(t, standardCheck{
		id:            "agency_lang_field",
		table:         "agency",
		field:         "agency_lang",
		run:           standard.AgencyLangField,
		skipForbidden: true,
	})
}
