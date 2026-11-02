package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"testing"
)

func TestRouteIdPatternConsistent(t *testing.T) {
	runCases(t, "trips_route_id_pattern_consistent", "route_id", "trips.txt", custom.RouteIdPatternConsistent, []scenario{
		{name: "OneTrip"}, {name: "Identical", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; "}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET route_id='Other' WHERE rowid=5", count: 1}, {name: "OtherPattern", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET route_id='Other',pattern_id='different' WHERE rowid=5"},
	})
}
