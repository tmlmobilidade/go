package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestShapeIdRouteDirectionMatch(t *testing.T) {
	runCases(t, "trips_shape_id_route_direction_match", "shape_id", "trips.txt", checks.ShapeIdRouteDirectionMatch, []scenario{
		{name: "Valid"}, {name: "Mismatch", values: map[string]any{"shape_id": "other"}, count: 1}, {name: "Missing", values: map[string]any{"route_id": ""}}, {name: "InvalidDirection", values: map[string]any{"direction_id": "2"}},
	})
}
