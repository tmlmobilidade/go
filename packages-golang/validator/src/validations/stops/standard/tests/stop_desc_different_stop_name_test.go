package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestStopDescDifferentStopName(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_desc_different_stop_name", "stop_desc", checks.StopDescDifferentStopName, []testutils.Case{
		{Name: "Different", Values: map[string]any{"stop_desc": "Near library", "stop_name": "Central"}},
		{Name: "Identical", Values: map[string]any{"stop_desc": "Central", "stop_name": "Central"}, Count: 1},
		{Name: "CaseSensitive", Values: map[string]any{"stop_desc": "CENTRAL", "stop_name": "Central"}},
		{Name: "WhitespaceSignificant", Values: map[string]any{"stop_desc": "Central ", "stop_name": "Central"}},
		{Name: "EmptyBoth", Values: map[string]any{"stop_desc": "", "stop_name": ""}, Count: 1},
		{Name: "NullBoth", Values: map[string]any{"stop_desc": nil, "stop_name": nil}, Count: 1},
		{Name: "MissingName", Values: map[string]any{"stop_desc": "description"}},
		{Name: "MissingDescription", Values: map[string]any{"stop_name": "Central"}},
		{Name: "MissingBoth", Values: map[string]any{}, Count: 1},
	})
}
