package stop_times_standard_test

import (
	checks "main/validations/stop_times/standard/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestDepartureTimeValid(t *testing.T) {
	testutils.CheckCases(t, "stop_times_departure_time_valid", "departure_time", checks.DepartureTimeValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"departure_time": "00:00:00"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"departure_time": "23:59:59"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"departure_time": "24:00:00"}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"departure_time": "25:30:00"}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"departure_time": ""}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"departure_time": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid2", Values: map[string]any{"departure_time": "9:00:00"}, Count: 1, WantError: false},
		{Name: "Invalid3", Values: map[string]any{"departure_time": "10:xx:00"}, Count: 1, WantError: false},
		{Name: "Invalid4", Values: map[string]any{"departure_time": "10:00"}, Count: 1, WantError: false},
		{Name: "Invalid5", Values: map[string]any{"departure_time": "10-00-00"}, Count: 1, WantError: false},
		{Name: "Invalid6", Values: map[string]any{"departure_time": nil}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
