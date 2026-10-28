package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestThursdayValidation(t *testing.T) {
	testutils.CheckPresence(t, "thursday", checks.ThursdayValidation)
}
