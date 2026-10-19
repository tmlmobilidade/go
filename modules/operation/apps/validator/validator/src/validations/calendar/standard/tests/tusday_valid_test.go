package calendar_standard_test

import (
	checks "main/validations/calendar/standard/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestTusdayValid(t *testing.T) {
	testutils.CheckWeekday(t, "tuesday", checks.TusdayValid)
}
