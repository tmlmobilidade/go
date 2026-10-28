package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestFridayValidation(t *testing.T) {
	testutils.CheckPresence(t, "friday", checks.FridayValidation)
}
