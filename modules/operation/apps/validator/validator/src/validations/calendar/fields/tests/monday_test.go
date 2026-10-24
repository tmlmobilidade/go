package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestMondayValidation(t *testing.T) {
	testutils.CheckPresence(t, "monday", checks.MondayValidation)
}
