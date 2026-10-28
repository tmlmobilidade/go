package stop_times_standard_test

import (
	checks "main/validations/stop_times/standard/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestContinuousPickupValid(t *testing.T) {
	testutils.CheckCases(t, "stop_times_continuous_pickup_valid_gtfs_enum", "continuous_pickup", checks.ContinuousPickupValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"continuous_pickup": "0"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"continuous_pickup": "1"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"continuous_pickup": "2"}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"continuous_pickup": "3"}, Count: 0, WantError: false},
		{Name: "Valid4", Values: map[string]any{"continuous_pickup": ""}, Count: 0, WantError: false},
		{Name: "Valid5", Values: map[string]any{"continuous_pickup": nil}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"continuous_pickup": "-1"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"continuous_pickup": "4"}, Count: 1, WantError: false},
		{Name: "Invalid2", Values: map[string]any{"continuous_pickup": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid3", Values: map[string]any{"continuous_pickup": "1.5"}, Count: 1, WantError: false},
		{Name: "Invalid4", Values: map[string]any{"continuous_pickup": "999999999999999999"}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}},
		{Name: "start_pickup_drop_off_window/0", Values: map[string]any{"continuous_pickup": "0", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/0", Values: map[string]any{"continuous_pickup": "0", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/1", Values: map[string]any{"continuous_pickup": "1", "start_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "end_pickup_drop_off_window/1", Values: map[string]any{"continuous_pickup": "1", "end_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "start_pickup_drop_off_window/2", Values: map[string]any{"continuous_pickup": "2", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/2", Values: map[string]any{"continuous_pickup": "2", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/3", Values: map[string]any{"continuous_pickup": "3", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/3", Values: map[string]any{"continuous_pickup": "3", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/", Values: map[string]any{"continuous_pickup": "", "start_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "end_pickup_drop_off_window/", Values: map[string]any{"continuous_pickup": "", "end_pickup_drop_off_window": "10:00:00"}, Count: 0},
	})
}
