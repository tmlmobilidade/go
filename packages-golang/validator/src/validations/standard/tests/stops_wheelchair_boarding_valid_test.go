package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestWheelchairBoardingValid(t *testing.T) {
	validationutils.StopsCheckCases(t, "stops_wheelchair_boarding_valid", "wheelchair_boarding", standard.WheelchairBoardingValid, []validationutils.StopsCase{
		{Name: "Valid0", Values: map[string]any{"wheelchair_boarding": "0"}},
		{Name: "Valid1", Values: map[string]any{"wheelchair_boarding": "1"}},
		{Name: "Valid2", Values: map[string]any{"wheelchair_boarding": "2"}},
		{Name: "AboveMaximum", Values: map[string]any{"wheelchair_boarding": "3"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"wheelchair_boarding": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"wheelchair_boarding": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"wheelchair_boarding": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"wheelchair_boarding": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"wheelchair_boarding": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"wheelchair_boarding": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"wheelchair_boarding": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
