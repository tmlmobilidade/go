package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasStopSignValid(t *testing.T) {
	testutils.CheckCases(t, "stops_has_stop_sign_valid", "has_stop_sign", checks.HasStopSignValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"has_stop_sign": "0"}},
		{Name: "Valid1", Values: map[string]any{"has_stop_sign": "1"}},
		{Name: "Valid2", Values: map[string]any{"has_stop_sign": "2"}},
		{Name: "Valid3", Values: map[string]any{"has_stop_sign": "3"}},
		{Name: "AboveMaximum", Values: map[string]any{"has_stop_sign": "4"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"has_stop_sign": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"has_stop_sign": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"has_stop_sign": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"has_stop_sign": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"has_stop_sign": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"has_stop_sign": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"has_stop_sign": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
