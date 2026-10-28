package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasTariffsInformationAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_has_tariffs_information_allowed", "has_tariffs_information", checks.HasTariffsInformationAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"has_tariffs_information": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"has_tariffs_information": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"has_tariffs_information": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"has_tariffs_information": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"has_tariffs_information": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"has_tariffs_information": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"has_tariffs_information": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"has_tariffs_information": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"has_tariffs_information": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"has_tariffs_information": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"has_tariffs_information": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"has_tariffs_information": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
