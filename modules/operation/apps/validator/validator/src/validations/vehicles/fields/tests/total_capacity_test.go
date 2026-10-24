package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestTotalCapacityField(t *testing.T) {
	testutils.CheckPresence(t, "total_capacity", checks.TotalCapacityField)
}
