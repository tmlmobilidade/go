package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRiderCategoriesEligibilityUrl(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "rider_categories_eligibility_url_field",
		table: "rider_categories",
		field: "eligibility_url",
		run:   standard.EligibilityUrlField,
	})
}
