package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestDropOffTypeField(t *testing.T) {
	testutils.CheckPresence(t, "drop_off_type", checks.DropOffTypeField)
}
