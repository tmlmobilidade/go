package calendar_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/calendar/utils"
	"testing"
)

func TestStartDateValidation(t *testing.T) {
	testutils.CheckPresence(t, "start_date", checks.StartDateValidation)
}
