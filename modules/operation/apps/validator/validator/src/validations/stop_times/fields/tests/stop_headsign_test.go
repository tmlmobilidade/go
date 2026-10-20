package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestStopHeadsignField(t *testing.T) {
	testutils.CheckPresence(t, "stop_headsign", checks.StopHeadsignField)
}
