package frequencies_fields_test

import (
	checks "main/validations/frequencies/fields/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestExactTimesField(t *testing.T) {
	testutils.CheckPresence(t, "exact_times", checks.ExactTimesField)
}
