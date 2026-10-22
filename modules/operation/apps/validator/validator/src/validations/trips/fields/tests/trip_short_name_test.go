package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestTripShortNameField(t *testing.T) {
	testutils.CheckPresence(t, "trip_short_name", checks.TripShortNameField)
}
