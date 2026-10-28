package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestSaturdayValidation(t *testing.T) {
	validationutils.CalendarCheckPresence(t, "saturday", fields.SaturdayValidation)
}
