package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestVehicleTypeField(t *testing.T) {
	testutils.CheckPresence(t, "vehicle_type", checks.VehicleTypeField)
}
