package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"main/types"
	"testing"
)

func TestLocationTypeAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_location_type_allowed", "location_type", checks.LocationTypeAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"location_type": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"location_type": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"location_type": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"location_type": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"location_type": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"location_type": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"location_type": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"location_type": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"location_type": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"location_type": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"location_type": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"location_type": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
