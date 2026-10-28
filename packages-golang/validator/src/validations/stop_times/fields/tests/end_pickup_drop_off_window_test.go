package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestEndPickupDropOffWindowField(t *testing.T) {
	testutils.CheckPresence(t, "end_pickup_drop_off_window", checks.EndPickupDropOffWindowField)
}

func TestEndPickupDropOffWindowFieldTimedStop(t *testing.T) {
	testutils.CheckCases(t, "stop_times_end_pickup_drop_off_window_field", "end_pickup_drop_off_window", checks.EndPickupDropOffWindowField, []testutils.Case{
		{Name: "Arrival", Values: map[string]any{"arrival_time": "10:00:00"}},
		{Name: "Departure", Values: map[string]any{"departure_time": "10:00:00"}},
		{Name: "Both", Values: map[string]any{"arrival_time": "10:00:00", "departure_time": "10:01:00"}},
	})
}
