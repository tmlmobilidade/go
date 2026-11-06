package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRiderCategoriesRiderCategoryId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "rider_categories_rider_category_id_field",
		table: "rider_categories",
		field: "rider_category_id",
		run:   standard.RiderCategoryIdField,
	})
}
