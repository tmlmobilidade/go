package trips_fields_test

import (
	checks "main/validations/trips/fields/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestTripIdField(t *testing.T) { testutils.CheckPresence(t, "trip_id", checks.TripIdField) }
