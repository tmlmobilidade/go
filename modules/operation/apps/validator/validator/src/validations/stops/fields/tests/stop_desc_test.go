package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopDescField(t *testing.T) {
	testutils.CheckPresence(t, "stop_desc", checks.StopDescField, 1)
}
