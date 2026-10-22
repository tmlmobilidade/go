package frequencies_fields_test

import (
	checks "main/validations/frequencies/fields/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestTripIdField(t *testing.T) { testutils.CheckPresence(t, "trip_id", checks.TripIdField) }
