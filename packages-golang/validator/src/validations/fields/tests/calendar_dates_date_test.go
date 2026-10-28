package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDateField(t *testing.T) {
	validationutils.CalendarDatesCheckPresence(t, "date", fields.DateField)
}
