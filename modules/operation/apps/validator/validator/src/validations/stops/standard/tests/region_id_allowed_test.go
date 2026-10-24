package stops_standard_test

import (
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestRegionIdAllowed(t *testing.T) {
	options := func(values ...string) *[]string { return &values }
	testutils.CheckCases(t, "stops_region_id_allowed", "region_id", checks.RegionIdAllowed, []testutils.Case{
		{Name: "NoOptions", Values: map[string]any{"region_id": "unexpected"}, Options: nil},
		{Name: "EmptyOptions", Values: map[string]any{"region_id": "value"}, Count: 1, Options: options()},
		{Name: "Allowed", Values: map[string]any{"region_id": "value"}, Options: options("value", "other")},
		{Name: "Denied", Values: map[string]any{"region_id": "absent"}, Count: 1, Options: options("value")},
		{Name: "CaseSensitive", Values: map[string]any{"region_id": "VALUE"}, Count: 1, Options: options("value")},
		{Name: "Whitespace", Values: map[string]any{"region_id": " value "}, Count: 1, Options: options("value")},
		{Name: "Wildcard", Values: map[string]any{"region_id": "anything"}, Options: options(types.ALL_OPTIONS)},
		{Name: "WildcardMixed", Values: map[string]any{"region_id": "anything"}, Options: options("other", types.ALL_OPTIONS)},
		{Name: "EmptyAllowed", Values: map[string]any{"region_id": ""}, Options: options("")},
		{Name: "EmptyDenied", Values: map[string]any{"region_id": ""}, Count: 1, Options: options("value")},
		{Name: "NullDenied", Values: map[string]any{"region_id": nil}, Count: 1, Options: options("value")},
		{Name: "QuotedValue", Values: map[string]any{"region_id": "O'Brien"}, Options: options("O'Brien")},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1, Options: options("value")},
	})
}
