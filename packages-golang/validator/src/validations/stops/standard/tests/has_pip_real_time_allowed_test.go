package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasPipRealTimeAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_has_pip_real_time_allowed", "has_pip_real_time", checks.HasPipRealTimeAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"has_pip_real_time": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"has_pip_real_time": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"has_pip_real_time": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"has_pip_real_time": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"has_pip_real_time": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"has_pip_real_time": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"has_pip_real_time": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"has_pip_real_time": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"has_pip_real_time": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"has_pip_real_time": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"has_pip_real_time": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"has_pip_real_time": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
