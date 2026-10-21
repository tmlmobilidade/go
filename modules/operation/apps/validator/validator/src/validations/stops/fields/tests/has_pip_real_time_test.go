package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasPipRealTimeField(t *testing.T) {
	testutils.CheckPresence(t, "has_pip_real_time", checks.HasPipRealTimeField, 1)
}
