package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestRiderCategoryNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "rider_categories_rider_category_name_field",
		table: "rider_categories",
		field: "rider_category_name",
		run:   fields.RiderCategoryNameField,
	})
}
