package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestEndPickupDropOffWindowField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "end_pickup_drop_off_window", fields.EndPickupDropOffWindowField)
}

func TestEndPickupDropOffWindowFieldTimedStop(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_end_pickup_drop_off_window_field", "end_pickup_drop_off_window", fields.EndPickupDropOffWindowField, []validationutils.StopTimesCase{
		{Name: "Arrival", Values: map[string]any{"arrival_time": "10:00:00"}},
		{Name: "Departure", Values: map[string]any{"departure_time": "10:00:00"}},
		{Name: "Both", Values: map[string]any{"arrival_time": "10:00:00", "departure_time": "10:01:00"}},
	})
}
