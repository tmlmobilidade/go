package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopTimezoneField(t *testing.T) {
	testutils.CheckPresence(t, "stop_timezone", checks.StopTimezoneField, 1)
}
