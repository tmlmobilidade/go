package calendar_dates_fields_test

import (
	checks "main/validations/calendar_dates/fields/checks"
	testutils "main/validations/calendar_dates/utils"
	"testing"
)

func TestServiceIdValidation(t *testing.T) {
	testutils.CheckPresence(t, "service_id", checks.ServiceIdValidation)
}
