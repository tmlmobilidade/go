package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestCarCapacityField(t *testing.T) {
	testutils.CheckPresence(t, "car_capacity", checks.CarCapacityField)
}
