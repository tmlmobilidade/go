package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestWheelchairAccessibleField(t *testing.T) {
	testutils.CheckPresence(t, "wheelchair_accessible", checks.WheelchairAccessibleField)
}
