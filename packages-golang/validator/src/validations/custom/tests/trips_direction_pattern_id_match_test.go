package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestDirectionPatternIdMatch(t *testing.T) {
	runCases(t, "trips_direction_pattern_id_match", "direction_pattern_id_match", "trips.txt", custom.DirectionPatternIdMatch, []scenario{
		{name: "Valid"}, {name: "Missing", values: map[string]any{"direction_id": ""}, count: 1}, {name: "PatternFormat", values: map[string]any{"pattern_id": "bad"}, count: 1}, {name: "PatternDirection", values: map[string]any{"pattern_id": "R1_2_1"}, count: 1}, {name: "InvalidInteger", values: map[string]any{"direction_id": "bad"}}, {name: "Mismatch", values: map[string]any{"direction_id": "1"}, count: 1},
	})
}
