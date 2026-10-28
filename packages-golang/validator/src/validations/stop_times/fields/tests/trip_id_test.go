package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestTripIdField(t *testing.T) {
	testutils.CheckPresence(t, "trip_id", checks.TripIdField)
}
