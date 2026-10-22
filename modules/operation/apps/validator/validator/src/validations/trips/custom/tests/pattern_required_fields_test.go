package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestPatternRequiredFields(t *testing.T) {
	runCases(t, "trips_pattern_id_trip_has_required_fields_for_grouping", "pattern_id", "trips.txt", checks.PatternRequiredFields, []scenario{
		{name: "Present"}, {name: "shape_id", values: map[string]any{"shape_id": ""}, count: 1}, {name: "route_id", values: map[string]any{"route_id": ""}, count: 1}, {name: "direction_id", values: map[string]any{"direction_id": ""}, count: 1}, {name: "trip_headsign", values: map[string]any{"trip_headsign": ""}, count: 1},
	})
}
