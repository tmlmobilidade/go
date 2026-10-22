package rider_categories_fields_test

import (
	checks "main/validations/rider_categories/fields/checks"
	testutils "main/validations/rider_categories/utils"
	"testing"
)

func TestIsDefaultFareCategoryField(t *testing.T) {
	testutils.CheckPresence(t, "is_default_fare_category", checks.IsDefaultFareCategoryField)
}
