package stop_times_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestStartPickupDropOffWindowValid(t *testing.T) {
	testutils.CheckCases(t, "stop_times_start_pickup_drop_off_window_valid", "start_pickup_drop_off_window", checks.StartPickupDropOffWindowValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"start_pickup_drop_off_window": "25:00:00"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"start_pickup_drop_off_window": ""}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"start_pickup_drop_off_window": nil}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"start_pickup_drop_off_window": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"start_pickup_drop_off_window": "10:xx:00"}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}},
		{Name: "Required/location_group_id", Values: map[string]any{"location_group_id": "value"}, Count: 1},
		{Name: "Present/location_group_id", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00", "location_group_id": "value"}},
		{Name: "Required/location_id", Values: map[string]any{"location_id": "value"}, Count: 1},
		{Name: "Present/location_id", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00", "location_id": "value"}},
		{Name: "Required/end_pickup_drop_off_window", Values: map[string]any{"end_pickup_drop_off_window": "value"}, Count: 1},
		{Name: "Present/end_pickup_drop_off_window", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00", "end_pickup_drop_off_window": "value"}},
		{Name: "Conflict/arrival_time", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00", "arrival_time": "10:00:00"}, Count: 1},
		{Name: "AbsentWithTime/arrival_time", Values: map[string]any{"arrival_time": "10:00:00", "location_id": "L1"}},
		{Name: "Conflict/departure_time", Values: map[string]any{"start_pickup_drop_off_window": "10:00:00", "departure_time": "10:00:00"}, Count: 1},
		{Name: "AbsentWithTime/departure_time", Values: map[string]any{"departure_time": "10:00:00", "location_id": "L1"}},
	})
}
