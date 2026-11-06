package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestEligibilityUrlField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "rider_categories_eligibility_url_field",
		table: "rider_categories",
		field: "eligibility_url",
		run:   fields.EligibilityUrlField,
	})
}
