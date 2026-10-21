package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopLatField(t *testing.T) {
	testutils.CheckPresence(t, "stop_lat", checks.StopLatField, 1)
}
