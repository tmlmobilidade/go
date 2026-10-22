package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestShapeIdMaxTwoPerRoute(t *testing.T) {
	runCases(t, "trips_shape_id_max_two_per_route", "shape_id", "trips.txt", checks.ShapeIdMaxTwoPerRoute, []scenario{
		{name: "One"}, {name: "Two", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='second' WHERE rowid=5"}, {name: "Three", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET shape_id='second' WHERE rowid=5;UPDATE trips SET shape_id='third' WHERE rowid=6", count: 1},
	})
}
