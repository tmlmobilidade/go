package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPriceField(t *testing.T) {
	validationutils.FareAttributesCheckPresence(t, "price", fields.PriceField)
}
