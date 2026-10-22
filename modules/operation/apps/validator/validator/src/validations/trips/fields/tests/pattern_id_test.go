package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestPatternIdField(t *testing.T) {
	testutils.CheckPresence(t, "pattern_id", checks.PatternIdField)
}
