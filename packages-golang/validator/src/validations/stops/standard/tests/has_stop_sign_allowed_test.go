package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasStopSignAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_has_stop_sign_allowed", "has_stop_sign", checks.HasStopSignAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"has_stop_sign": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"has_stop_sign": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"has_stop_sign": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"has_stop_sign": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"has_stop_sign": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"has_stop_sign": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"has_stop_sign": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"has_stop_sign": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"has_stop_sign": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"has_stop_sign": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"has_stop_sign": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"has_stop_sign": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
