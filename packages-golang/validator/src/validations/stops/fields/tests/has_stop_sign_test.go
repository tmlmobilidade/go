package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasStopSignField(t *testing.T) {
	testutils.CheckPresence(t, "has_stop_sign", checks.HasStopSignField, 1)
}
