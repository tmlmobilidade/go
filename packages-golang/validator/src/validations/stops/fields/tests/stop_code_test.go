package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopCodeField(t *testing.T) {
	testutils.CheckPresence(t, "stop_code", checks.StopCodeField, 1)
}
