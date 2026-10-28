package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFridayValidation(t *testing.T) {
	validationutils.CalendarCheckPresence(t, "friday", fields.FridayValidation)
}
