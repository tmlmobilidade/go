package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestSaturdayValidation(t *testing.T) {
	testutils.CheckPresence(t, "saturday", checks.SaturdayValidation)
}
