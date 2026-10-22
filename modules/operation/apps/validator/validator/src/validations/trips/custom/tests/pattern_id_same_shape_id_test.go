package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestPatternIdSameShapeId(t *testing.T) {
	runCases(t, "trips_pattern_id_needs_to_be_the_same_as_shape_id", "pattern_id", "trips.txt", checks.PatternIdSameShapeId, []scenario{
		{name: "Mismatch", count: 1}, {name: "Valid", values: map[string]any{"pattern_id": "R1_0"}}, {name: "Missing", values: map[string]any{"shape_id": ""}},
	})
}
