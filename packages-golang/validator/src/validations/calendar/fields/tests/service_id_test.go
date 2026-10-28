package calendar_fields_test

import (
	checks "main/validations/calendar/fields/checks"
	testutils "main/validations/calendar/utils"
	"testing"
)

func TestServiceIdValidation(t *testing.T) {
	testutils.CheckPresence(t, "service_id", checks.ServiceIdValidation)
}
