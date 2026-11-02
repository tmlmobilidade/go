package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFareAttributesFareIdField(t *testing.T) {
	validationutils.FareAttributesCheckPresence(t, "fare_id", fields.FareAttributesFareIdField)
}
