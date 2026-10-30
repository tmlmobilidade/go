package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestEndPickupDropOffWindowValid(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_end_pickup_drop_off_window_valid", "end_pickup_drop_off_window", standard.EndPickupDropOffWindowValid, []validationutils.StopTimesCase{
		{Name: "Valid0", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"end_pickup_drop_off_window": "25:00:00"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"end_pickup_drop_off_window": ""}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"end_pickup_drop_off_window": nil}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"end_pickup_drop_off_window": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"end_pickup_drop_off_window": "10:xx:00"}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}},
		{Name: "Required/location_group_id", Values: map[string]any{"location_group_id": "value"}, Count: 1},
		{Name: "Present/location_group_id", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00", "location_group_id": "value"}},
		{Name: "Required/location_id", Values: map[string]any{"location_id": "value"}, Count: 1},
		{Name: "Present/location_id", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00", "location_id": "value"}},
		{Name: "Required/start_pickup_drop_off_window", Values: map[string]any{"start_pickup_drop_off_window": "value"}, Count: 1},
		{Name: "Present/start_pickup_drop_off_window", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00", "start_pickup_drop_off_window": "value"}},
		{Name: "Conflict/arrival_time", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00", "arrival_time": "10:00:00"}, Count: 1},
		{Name: "AbsentWithTime/arrival_time", Values: map[string]any{"arrival_time": "10:00:00", "location_id": "L1"}},
		{Name: "Conflict/departure_time", Values: map[string]any{"end_pickup_drop_off_window": "10:00:00", "departure_time": "10:00:00"}, Count: 1},
		{Name: "AbsentWithTime/departure_time", Values: map[string]any{"departure_time": "10:00:00", "location_id": "L1"}},
	})
}
