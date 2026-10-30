package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLocationTypeValid(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_location_type_valid", "location_type", standard.LocationTypeValid, []validationutils.StopsCase{
		{Name: "Valid0", Values: map[string]any{"location_type": "0"}},
		{Name: "Valid1", Values: map[string]any{"location_type": "1"}},
		{Name: "Valid2", Values: map[string]any{"location_type": "2"}},
		{Name: "Valid3", Values: map[string]any{"location_type": "3"}},
		{Name: "Valid4", Values: map[string]any{"location_type": "4"}},
		{Name: "AboveMaximum", Values: map[string]any{"location_type": "5"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"location_type": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"location_type": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"location_type": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"location_type": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"location_type": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"location_type": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"location_type": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
