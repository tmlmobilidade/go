package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStartDateValidation(t *testing.T) {
	validationutils.CalendarCheckPresence(t, "start_date", fields.StartDateValidation)
}
