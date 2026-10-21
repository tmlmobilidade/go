package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestWheelchairBoardingField(t *testing.T) {
	testutils.CheckPresence(t, "wheelchair_boarding", checks.WheelchairBoardingField, 1)
}
