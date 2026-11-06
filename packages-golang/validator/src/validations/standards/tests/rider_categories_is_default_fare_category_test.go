package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRiderCategoriesIsDefaultFareCategory(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "rider_categories_is_default_fare_category_field",
		table: "rider_categories",
		field: "is_default_fare_category",
		run:   standard.IsDefaultFareCategoryField,
	})
}
