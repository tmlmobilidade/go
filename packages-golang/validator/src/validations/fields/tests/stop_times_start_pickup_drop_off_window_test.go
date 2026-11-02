package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStartPickupDropOffWindowField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "start_pickup_drop_off_window", fields.StartPickupDropOffWindowField)
}

func TestStartPickupDropOffWindowFieldTimedStop(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_start_pickup_drop_off_window_field", "start_pickup_drop_off_window", fields.StartPickupDropOffWindowField, []validationutils.StopTimesCase{
		{Name: "Arrival", Values: map[string]any{"arrival_time": "10:00:00"}},
		{Name: "Departure", Values: map[string]any{"departure_time": "10:00:00"}},
		{Name: "Both", Values: map[string]any{"arrival_time": "10:00:00", "departure_time": "10:01:00"}},
	})
}
