package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestContinuousDropOffField(t *testing.T) {
	testutils.CheckPresence(t, "continuous_drop_off", checks.ContinuousDropOffField)
}
