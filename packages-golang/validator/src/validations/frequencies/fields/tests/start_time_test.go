package frequencies_fields_test

import (
	checks "main/validations/frequencies/fields/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestStartTimeField(t *testing.T) {
	testutils.CheckPresence(t, "start_time", checks.StartTimeField)
}
