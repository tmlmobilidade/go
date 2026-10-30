package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestRiderCategoryIdField(t *testing.T) {
	validationutils.RiderCategoriesCheckPresence(t, "rider_category_id", fields.RiderCategoryIdField)
}
