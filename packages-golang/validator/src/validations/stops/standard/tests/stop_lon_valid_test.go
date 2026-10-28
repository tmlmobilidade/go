package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestStopLonValid(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_lon_valid", "stop_lon", checks.StopLonValid, []testutils.Case{
		{Name: "Minimum", Values: map[string]any{"stop_lon": "-180"}},
		{Name: "Maximum", Values: map[string]any{"stop_lon": "180"}},
		{Name: "Zero", Values: map[string]any{"stop_lon": "0"}},
		{Name: "Decimal", Values: map[string]any{"stop_lon": "38.72"}},
		{Name: "Exponent", Values: map[string]any{"stop_lon": "1e1"}},
		{Name: "BelowMinimum", Values: map[string]any{"stop_lon": "-180.001"}, Count: 1},
		{Name: "AboveMaximum", Values: map[string]any{"stop_lon": "180.001"}, Count: 1},
		{Name: "NaN", Values: map[string]any{"stop_lon": "NaN"}, Count: 1},
		{Name: "PositiveInfinity", Values: map[string]any{"stop_lon": "+Inf"}, Count: 1},
		{Name: "NegativeInfinity", Values: map[string]any{"stop_lon": "-Inf"}, Count: 1},
		{Name: "Text", Values: map[string]any{"stop_lon": "bad"}, WantError: true},
		{Name: "Empty", Values: map[string]any{"stop_lon": ""}, WantError: true},
		{Name: "Null", Values: map[string]any{"stop_lon": nil}, WantError: true},
		{Name: "Whitespace", Values: map[string]any{"stop_lon": " 1 "}, WantError: true},
		{Name: "Overflow", Values: map[string]any{"stop_lon": "1e999"}, WantError: true},
		{Name: "MissingColumn", Values: map[string]any{}, WantError: true},
	})
}
