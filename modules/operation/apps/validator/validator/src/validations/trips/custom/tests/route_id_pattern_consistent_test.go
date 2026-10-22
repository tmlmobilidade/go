package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestRouteIdPatternConsistent(t *testing.T) {
	runCases(t, "trips_route_id_consistent_for_all_patterns_in_trips", "route_id", "trips.txt", checks.RouteIdPatternConsistent, []scenario{
		{name: "OneTrip"}, {name: "Identical", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; "}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET route_id='Other' WHERE rowid=5", count: 1}, {name: "OtherPattern", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET route_id='Other',pattern_id='different' WHERE rowid=5"},
	})
}
