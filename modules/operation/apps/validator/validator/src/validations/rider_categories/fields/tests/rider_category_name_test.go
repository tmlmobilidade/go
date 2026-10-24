package rider_categories_fields_test

import (
	checks "main/validations/rider_categories/fields/checks"
	testutils "main/validations/rider_categories/utils"
	"testing"
)

func TestRiderCategoryNameField(t *testing.T) {
	testutils.CheckPresence(t, "rider_category_name", checks.RiderCategoryNameField)
}
