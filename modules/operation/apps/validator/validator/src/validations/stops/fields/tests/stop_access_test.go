package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopAccessField(t *testing.T) {
	testutils.CheckPresence(t, "stop_access", checks.StopAccessField, 0)
}
