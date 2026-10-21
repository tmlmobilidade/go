package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasNetworkMapAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_has_network_map_allowed", "has_network_map", checks.HasNetworkMapAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"has_network_map": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"has_network_map": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"has_network_map": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"has_network_map": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"has_network_map": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"has_network_map": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"has_network_map": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"has_network_map": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"has_network_map": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"has_network_map": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"has_network_map": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"has_network_map": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
