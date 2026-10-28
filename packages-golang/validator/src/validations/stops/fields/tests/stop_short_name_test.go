package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopShortNameField(t *testing.T) {
	testutils.CheckPresence(t, "stop_short_name", checks.StopShortNameField, 1)
}
