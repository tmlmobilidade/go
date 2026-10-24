package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestDirectionPatternIdMatch(t *testing.T) {
	runCases(t, "trips_direction_pattern_id_match", "direction_pattern_id_match", "trips.txt", checks.DirectionPatternIdMatch, []scenario{
		{name: "Valid"}, {name: "Missing", values: map[string]any{"direction_id": ""}, count: 1}, {name: "PatternFormat", values: map[string]any{"pattern_id": "bad"}, count: 1}, {name: "PatternDirection", values: map[string]any{"pattern_id": "R1_2_1"}, count: 1}, {name: "InvalidInteger", values: map[string]any{"direction_id": "bad"}}, {name: "Mismatch", values: map[string]any{"direction_id": "1"}, count: 1},
	})
}
