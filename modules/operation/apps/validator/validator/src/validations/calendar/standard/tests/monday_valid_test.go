package calendar_standard_test

import (
	checks "main/validations/calendar/standard/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestMondayValid(t *testing.T) {
	testutils.CheckWeekday(t, "monday", checks.MondayValid)
}
