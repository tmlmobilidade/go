package stop_times_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestStartPickupDropOffWindowField(t *testing.T) {
	testutils.CheckPresence(t, "start_pickup_drop_off_window", checks.StartPickupDropOffWindowField)
}

func TestStartPickupDropOffWindowFieldTimedStop(t *testing.T) {
	testutils.CheckCases(t, "stop_times_start_pickup_drop_off_window_field", "start_pickup_drop_off_window", checks.StartPickupDropOffWindowField, []testutils.Case{
		{Name: "Arrival", Values: map[string]any{"arrival_time": "10:00:00"}},
		{Name: "Departure", Values: map[string]any{"departure_time": "10:00:00"}},
		{Name: "Both", Values: map[string]any{"arrival_time": "10:00:00", "departure_time": "10:01:00"}},
	})
}
