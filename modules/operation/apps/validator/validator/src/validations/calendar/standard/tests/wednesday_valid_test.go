package calendar_standard_test

import (
	checks "main/validations/calendar/standard/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestWednesdayValid(t *testing.T) {
	testutils.CheckWeekday(t, "wednesday", checks.WednesdayValid)
}
