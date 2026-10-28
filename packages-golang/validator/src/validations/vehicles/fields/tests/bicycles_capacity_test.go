package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestBicyclesCapacityField(t *testing.T) {
	testutils.CheckPresence(t, "bicycles_capacity", checks.BicyclesCapacityField)
}
