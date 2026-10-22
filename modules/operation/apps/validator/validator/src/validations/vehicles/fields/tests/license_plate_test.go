package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestLicensePlateField(t *testing.T) {
	testutils.CheckPresence(t, "license_plate", checks.LicensePlateField)
}
