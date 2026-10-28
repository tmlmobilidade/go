package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasBenchValid(t *testing.T) {
	testutils.CheckCases(t, "stops_has_bench_valid", "has_bench", checks.HasBenchValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"has_bench": "0"}},
		{Name: "Valid1", Values: map[string]any{"has_bench": "1"}},
		{Name: "Valid2", Values: map[string]any{"has_bench": "2"}},
		{Name: "Valid3", Values: map[string]any{"has_bench": "3"}},
		{Name: "AboveMaximum", Values: map[string]any{"has_bench": "4"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"has_bench": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"has_bench": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"has_bench": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"has_bench": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"has_bench": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"has_bench": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"has_bench": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
