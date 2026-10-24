package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"strings"
	"testing"
)

func TestTripIdMaxLength(t *testing.T) {
	runCases(t, "trips_trip_id_max_length", "trip_id_limit_characters", "trips.txt", checks.TripIdMaxLength, []scenario{
		{name: "Valid"}, {name: "Limit", values: map[string]any{"trip_id": strings.Repeat("a", 36)}}, {name: "TooLong", values: map[string]any{"trip_id": strings.Repeat("a", 37)}, count: 1}, {name: "Missing", values: map[string]any{"trip_id": nil}},
	})
}
