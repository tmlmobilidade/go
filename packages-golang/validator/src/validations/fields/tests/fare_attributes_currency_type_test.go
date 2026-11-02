package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestCurrencyTypeField(t *testing.T) {
	validationutils.FareAttributesCheckPresence(t, "currency_type", fields.CurrencyTypeField)
}
