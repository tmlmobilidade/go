package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopTimesContinuousDropOffValid(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_continuous_drop_off_valid_gtfs_enum", "continuous_drop_off", standard.StopTimesContinuousDropOffValid, []validationutils.StopTimesCase{
		{Name: "Valid0", Values: map[string]any{"continuous_drop_off": "0"}, Count: 0, WantError: false},
		{Name: "Valid1", Values: map[string]any{"continuous_drop_off": "1"}, Count: 0, WantError: false},
		{Name: "Valid2", Values: map[string]any{"continuous_drop_off": "2"}, Count: 0, WantError: false},
		{Name: "Valid3", Values: map[string]any{"continuous_drop_off": "3"}, Count: 0, WantError: false},
		{Name: "Valid4", Values: map[string]any{"continuous_drop_off": ""}, Count: 0, WantError: false},
		{Name: "Valid5", Values: map[string]any{"continuous_drop_off": nil}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"continuous_drop_off": "-1"}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"continuous_drop_off": "4"}, Count: 1, WantError: false},
		{Name: "Invalid2", Values: map[string]any{"continuous_drop_off": "bad"}, Count: 1, WantError: false},
		{Name: "Invalid3", Values: map[string]any{"continuous_drop_off": "1.5"}, Count: 1, WantError: false},
		{Name: "Invalid4", Values: map[string]any{"continuous_drop_off": "999999999999999999"}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}},
		{Name: "start_pickup_drop_off_window/0", Values: map[string]any{"continuous_drop_off": "0", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/0", Values: map[string]any{"continuous_drop_off": "0", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/1", Values: map[string]any{"continuous_drop_off": "1", "start_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "end_pickup_drop_off_window/1", Values: map[string]any{"continuous_drop_off": "1", "end_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "start_pickup_drop_off_window/2", Values: map[string]any{"continuous_drop_off": "2", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/2", Values: map[string]any{"continuous_drop_off": "2", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/3", Values: map[string]any{"continuous_drop_off": "3", "start_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "end_pickup_drop_off_window/3", Values: map[string]any{"continuous_drop_off": "3", "end_pickup_drop_off_window": "10:00:00"}, Count: 1},
		{Name: "start_pickup_drop_off_window/", Values: map[string]any{"continuous_drop_off": "", "start_pickup_drop_off_window": "10:00:00"}, Count: 0},
		{Name: "end_pickup_drop_off_window/", Values: map[string]any{"continuous_drop_off": "", "end_pickup_drop_off_window": "10:00:00"}, Count: 0},
	})
}
