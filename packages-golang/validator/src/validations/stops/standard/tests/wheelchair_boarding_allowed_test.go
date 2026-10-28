package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"main/types"
	"testing"
)

func TestWheelchairBoardingAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_wheelchair_boarding_allowed", "wheelchair_boarding", checks.WheelchairBoardingAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"wheelchair_boarding": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"wheelchair_boarding": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"wheelchair_boarding": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"wheelchair_boarding": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"wheelchair_boarding": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"wheelchair_boarding": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"wheelchair_boarding": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"wheelchair_boarding": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"wheelchair_boarding": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"wheelchair_boarding": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"wheelchair_boarding": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"wheelchair_boarding": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
