package rider_categories_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/rider_categories/utils"
	"testing"
)

func TestEligibilityUrlField(t *testing.T) {
	testutils.CheckPresence(t, "eligibility_url", checks.EligibilityUrlField)
}
