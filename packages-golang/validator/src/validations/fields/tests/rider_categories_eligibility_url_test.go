package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestEligibilityUrlField(t *testing.T) {
	validationutils.RiderCategoriesCheckPresence(t, "eligibility_url", fields.EligibilityUrlField)
}
