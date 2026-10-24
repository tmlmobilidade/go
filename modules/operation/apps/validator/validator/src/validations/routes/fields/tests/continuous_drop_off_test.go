package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestContinuousDropOffField(t *testing.T) {
	testutils.CheckPresence(t, "continuous_drop_off", checks.ContinuousDropOffField)
}
