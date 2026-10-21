package stops_standard_test

import (
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasNetworkMapValid(t *testing.T) {
	testutils.CheckCases(t, "stops_has_network_map_valid", "has_network_map", checks.HasNetworkMapValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"has_network_map": "0"}},
		{Name: "Valid1", Values: map[string]any{"has_network_map": "1"}},
		{Name: "Valid2", Values: map[string]any{"has_network_map": "2"}},
		{Name: "Valid3", Values: map[string]any{"has_network_map": "3"}},
		{Name: "AboveMaximum", Values: map[string]any{"has_network_map": "4"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"has_network_map": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"has_network_map": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"has_network_map": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"has_network_map": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"has_network_map": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"has_network_map": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"has_network_map": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
