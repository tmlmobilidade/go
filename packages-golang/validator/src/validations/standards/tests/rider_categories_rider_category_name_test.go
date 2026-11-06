package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRiderCategoriesRiderCategoryName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "rider_categories_rider_category_name_field",
		table: "rider_categories",
		field: "rider_category_name",
		run:   standard.RiderCategoryNameField,
	})
}
