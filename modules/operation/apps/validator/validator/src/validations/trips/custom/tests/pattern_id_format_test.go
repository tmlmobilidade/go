package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestPatternIdFormat(t *testing.T) {
	runCases(t, "trips_pattern_id_matches_feed_pattern_id_syntax", "pattern_id", "trips.txt", checks.PatternIdFormat, []scenario{
		{name: "Default"}, {name: "Invalid", values: map[string]any{"pattern_id": "bad"}, count: 1}, {name: "Missing", values: map[string]any{"pattern_id": nil}}, {name: "Custom", values: map[string]any{"pattern_id": "ABC"}, options: []string{"^ABC$"}}, {name: "UnrecognizedRegexFallback", options: []string{"["}}, {name: "CustomMismatch", options: []string{"^ABC$"}, count: 1}, {name: "MultipleFormats", options: []string{"^ABC$", "^R1_0_1$"}},
	})
}
