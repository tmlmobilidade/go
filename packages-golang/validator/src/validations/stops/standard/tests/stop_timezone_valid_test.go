package stops_standard_test

import (
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopTimezoneValid(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_timezone_valid", "stop_timezone", checks.StopTimezoneValid, []testutils.Case{
		{Name: "Lisbon", Values: map[string]any{"stop_timezone": "Europe/Lisbon"}},
		{Name: "UTC", Values: map[string]any{"stop_timezone": "UTC"}},
		{Name: "NewYork", Values: map[string]any{"stop_timezone": "America/New_York"}},
		{Name: "EmptyDefaultsToUTC", Values: map[string]any{"stop_timezone": ""}},
		{Name: "NullDefaultsToUTC", Values: map[string]any{"stop_timezone": nil}},
		{Name: "MissingColumnDefaultsToUTC", Values: map[string]any{}},
		{Name: "Unknown", Values: map[string]any{"stop_timezone": "Europe/Atlantis"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"stop_timezone": " Europe/Lisbon "}, Count: 1},
		{Name: "Offset", Values: map[string]any{"stop_timezone": "+01:00"}, Count: 1},
	})
}
