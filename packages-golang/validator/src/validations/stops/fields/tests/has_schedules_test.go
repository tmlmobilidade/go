package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasSchedulesField(t *testing.T) {
	testutils.CheckPresence(t, "has_schedules", checks.HasSchedulesField, 1)
}
