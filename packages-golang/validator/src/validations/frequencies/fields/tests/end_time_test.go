package frequencies_fields_test

import (
	checks "main/validations/frequencies/fields/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestEndTimeField(t *testing.T) { testutils.CheckPresence(t, "end_time", checks.EndTimeField) }
