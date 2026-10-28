package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestContinuousPickupField(t *testing.T) {
	testutils.CheckPresence(t, "continuous_pickup", checks.ContinuousPickupField)
}
