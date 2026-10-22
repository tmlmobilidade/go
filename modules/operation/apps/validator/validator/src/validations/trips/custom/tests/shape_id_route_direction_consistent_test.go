package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestShapeIdRouteDirectionConsistent(t *testing.T) {
	runCases(t, "trips_shape_id_consistent_per_route_direction", "shape_id", "trips.txt", checks.ShapeIdRouteDirectionConsistent, []scenario{
		{name: "One"}, {name: "SameDirectionMismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='other' WHERE rowid=5", count: 1}, {name: "OppositeDirection", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='other',direction_id='1' WHERE rowid=5"}, {name: "InvalidDirection", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='other',direction_id='2' WHERE rowid=5"},
	})
}
