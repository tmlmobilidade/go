package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestVehicleIdField(t *testing.T) {
	testutils.CheckPresence(t, "vehicle_id", checks.VehicleIdField)
}
