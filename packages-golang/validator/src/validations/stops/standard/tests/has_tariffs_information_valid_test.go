package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasTariffsInformationValid(t *testing.T) {
	testutils.CheckCases(t, "stops_has_tariffs_information_valid", "has_tariffs_information", checks.HasTariffsInformationValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"has_tariffs_information": "0"}},
		{Name: "Valid1", Values: map[string]any{"has_tariffs_information": "1"}},
		{Name: "Valid2", Values: map[string]any{"has_tariffs_information": "2"}},
		{Name: "Valid3", Values: map[string]any{"has_tariffs_information": "3"}},
		{Name: "AboveMaximum", Values: map[string]any{"has_tariffs_information": "4"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"has_tariffs_information": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"has_tariffs_information": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"has_tariffs_information": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"has_tariffs_information": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"has_tariffs_information": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"has_tariffs_information": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"has_tariffs_information": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
