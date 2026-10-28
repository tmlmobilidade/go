package stops_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestPublicVisibleValid(t *testing.T) {
	testutils.CheckCases(t, "stops_public_visible_valid", "public_visible", checks.PublicVisibleValid, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"public_visible": "0"}},
		{Name: "Valid1", Values: map[string]any{"public_visible": "1"}},
		{Name: "AboveMaximum", Values: map[string]any{"public_visible": "2"}, Count: 1},
		{Name: "Negative", Values: map[string]any{"public_visible": "-1"}, Count: 1},
		{Name: "LeadingZero", Values: map[string]any{"public_visible": "01"}, Count: 1},
		{Name: "Decimal", Values: map[string]any{"public_visible": "1.0"}, Count: 1},
		{Name: "Whitespace", Values: map[string]any{"public_visible": " 1 "}, Count: 1},
		{Name: "Text", Values: map[string]any{"public_visible": "bad"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"public_visible": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"public_visible": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
