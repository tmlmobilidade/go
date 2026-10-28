package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestPatternIdSameShapeId(t *testing.T) {
	runCases(t, "trips_pattern_id_same_shape_id", "pattern_id", "trips.txt", custom.PatternIdSameShapeId, []scenario{
		{name: "Mismatch", count: 1}, {name: "Valid", values: map[string]any{"pattern_id": "R1_0"}}, {name: "Missing", values: map[string]any{"shape_id": ""}},
	})
}
