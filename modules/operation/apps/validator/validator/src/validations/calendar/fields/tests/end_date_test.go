package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestEndDateValidation(t *testing.T) {
	testutils.CheckPresence(t, "end_date", checks.EndDateValidation)
}
