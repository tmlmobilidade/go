package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopDescDifferentStopName(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_stop_desc_different_stop_name", "stop_desc", standard.StopDescDifferentStopName, []validationutils.StopsCase{
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
