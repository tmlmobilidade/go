package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestIsDefaultFareCategoryField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "rider_categories_is_default_fare_category_field",
		table: "rider_categories",
		field: "is_default_fare_category",
		run:   fields.IsDefaultFareCategoryField,
	})
}
