package rider_categories_fields_test

import (
	checks "main/validations/rider_categories/fields/checks"
	testutils "main/validations/rider_categories/utils"
	"testing"
)

func TestEligibilityUrlField(t *testing.T) {
	testutils.CheckPresence(t, "eligibility_url", checks.EligibilityUrlField)
}
