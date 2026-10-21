package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopLonField(t *testing.T) {
	testutils.CheckPresence(t, "stop_lon", checks.StopLonField, 1)
}
