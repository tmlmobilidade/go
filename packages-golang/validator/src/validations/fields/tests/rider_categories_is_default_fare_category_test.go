package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestIsDefaultFareCategoryField(t *testing.T) {
	validationutils.RiderCategoriesCheckPresence(t, "is_default_fare_category", fields.IsDefaultFareCategoryField)
}
