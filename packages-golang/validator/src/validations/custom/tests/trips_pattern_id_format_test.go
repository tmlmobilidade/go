package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestPatternIdFormat(t *testing.T) {
	runCases(t, "trips_pattern_id_format", "pattern_id", "trips.txt", custom.PatternIdFormat, []scenario{
		{name: "Default"}, {name: "Invalid", values: map[string]any{"pattern_id": "bad"}, count: 1}, {name: "Missing", values: map[string]any{"pattern_id": nil}}, {name: "Custom", values: map[string]any{"pattern_id": "ABC"}, options: []string{"^ABC$"}}, {name: "UnrecognizedRegexFallback", options: []string{"["}}, {name: "CustomMismatch", options: []string{"^ABC$"}, count: 1}, {name: "MultipleFormats", options: []string{"^ABC$", "^R1_0_1$"}},
	})
}
