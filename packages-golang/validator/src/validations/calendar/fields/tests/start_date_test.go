package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestStartDateValidation(t *testing.T) {
	testutils.CheckPresence(t, "start_date", checks.StartDateValidation)
}
