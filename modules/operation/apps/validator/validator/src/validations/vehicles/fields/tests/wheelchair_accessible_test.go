package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestWheelchairAccessibleField(t *testing.T) {
	testutils.CheckPresence(t, "wheelchair_accessible", checks.WheelchairAccessibleField)
}
