package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasShelterValid(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_has_shelter_valid", "has_shelter", standard.HasShelterValid, []validationutils.StopsCase{
		{Name: "Valid0", Values: map[string]any{"has_shelter": "0"}},
		{Name: "Valid1", Values: map[string]any{"has_shelter": "1"}},
		{Name: "Valid2", Values: map[string]any{"has_shelter": "2"}},
		{Name: "Valid3", Values: map[string]any{"has_shelter": "3"}},
		{Name: "AboveMaximum", Values: map[string]any{"has_shelter": "4"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"has_shelter": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"has_shelter": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"has_shelter": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"has_shelter": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"has_shelter": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"has_shelter": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"has_shelter": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
