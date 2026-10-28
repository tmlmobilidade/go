package calendar_standard_test

import (
	checks "main/validations/calendar/standard/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestSundayValid(t *testing.T) {
	testutils.CheckWeekday(t, "sunday", checks.SundayValid)
}
