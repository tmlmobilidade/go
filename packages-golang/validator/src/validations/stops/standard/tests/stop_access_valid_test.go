package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestStopAccessValid(t *testing.T) {
	testutils.CheckCases(t, "stops_stop_access_valid", "stop_access", checks.StopAccessValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"stop_access": "0"}},
		{Name: "Valid1", Values: map[string]any{"stop_access": "1"}},
		{Name: "AboveMaximum", Values: map[string]any{"stop_access": "2"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"stop_access": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"stop_access": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"stop_access": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"stop_access": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"stop_access": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"stop_access": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"stop_access": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
