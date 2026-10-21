package stops_standard_test

import (
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestStopLatValid(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_lat_valid", "stop_lat", checks.StopLatValid, []testutils.Case{
		{Name: "Minimum", Values: map[string]any{"stop_lat": "-90"}},
		{Name: "Maximum", Values: map[string]any{"stop_lat": "90"}},
		{Name: "Zero", Values: map[string]any{"stop_lat": "0"}},
		{Name: "Decimal", Values: map[string]any{"stop_lat": "38.72"}},
		{Name: "Exponent", Values: map[string]any{"stop_lat": "1e1"}},
		{Name: "BelowMinimum", Values: map[string]any{"stop_lat": "-90.001"}, Count: 1},
		{Name: "AboveMaximum", Values: map[string]any{"stop_lat": "90.001"}, Count: 1},
		{Name: "NaN", Values: map[string]any{"stop_lat": "NaN"}, Count: 1},
		{Name: "PositiveInfinity", Values: map[string]any{"stop_lat": "+Inf"}, Count: 1},
		{Name: "NegativeInfinity", Values: map[string]any{"stop_lat": "-Inf"}, Count: 1},
		{Name: "Text", Values: map[string]any{"stop_lat": "bad"}, WantError: true},
		{Name: "Empty", Values: map[string]any{"stop_lat": ""}, WantError: true},
		{Name: "Null", Values: map[string]any{"stop_lat": nil}, WantError: true},
		{Name: "Whitespace", Values: map[string]any{"stop_lat": " 1 "}, WantError: true},
		{Name: "Overflow", Values: map[string]any{"stop_lat": "1e999"}, WantError: true},
		{Name: "MissingColumn", Values: map[string]any{}, WantError: true},
	})
}
