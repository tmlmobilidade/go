package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestShapeIdRouteDirectionMatch(t *testing.T) {
	runCases(t, "trips_shape_id_route_direction_match", "shape_id", "trips.txt", custom.ShapeIdRouteDirectionMatch, []scenario{
		{name: "Valid"}, {name: "Mismatch", values: map[string]any{"shape_id": "other"}, count: 1}, {name: "Missing", values: map[string]any{"route_id": ""}}, {name: "InvalidDirection", values: map[string]any{"direction_id": "2"}},
	})
}
