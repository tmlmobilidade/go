package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestPlatformCodeAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_platform_code_allowed", "platform_code", checks.PlatformCodeAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"platform_code": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"platform_code": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"platform_code": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"platform_code": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"platform_code": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"platform_code": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"platform_code": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"platform_code": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"platform_code": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"platform_code": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"platform_code": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"platform_code": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
