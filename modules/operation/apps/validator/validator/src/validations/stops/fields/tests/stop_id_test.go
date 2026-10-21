package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopIdField(t *testing.T) {
	testutils.CheckPresence(t, "stop_id", checks.StopIdField, 1)
}
