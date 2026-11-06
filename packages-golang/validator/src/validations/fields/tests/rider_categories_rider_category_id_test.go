package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestRiderCategoryIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "rider_categories_rider_category_id_field",
		table: "rider_categories",
		field: "rider_category_id",
		run:   fields.RiderCategoryIdField,
	})
}
