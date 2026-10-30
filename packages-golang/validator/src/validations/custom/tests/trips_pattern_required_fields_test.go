package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestPatternRequiredFields(t *testing.T) {
	runCases(t, "trips_pattern_required_fields", "pattern_id", "trips.txt", custom.PatternRequiredFields, []scenario{
		{name: "Present"}, {name: "shape_id", values: map[string]any{"shape_id": ""}, count: 1}, {name: "route_id", values: map[string]any{"route_id": ""}, count: 1}, {name: "direction_id", values: map[string]any{"direction_id": ""}, count: 1}, {name: "trip_headsign", values: map[string]any{"trip_headsign": ""}, count: 1},
	})
}
