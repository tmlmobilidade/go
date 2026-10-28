package trips_custom_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/custom/checks"
	"testing"
)

func TestTripHeadsignPatternConsistent(t *testing.T) {
	runCases(t, "trips_trip_headsign_pattern_consistent", "trip_headsign", "trips.txt", checks.TripHeadsignPatternConsistent, []scenario{
		{name: "OneTrip"}, {name: "Identical", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; "}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='Other' WHERE rowid=5", count: 1}, {name: "OtherPattern", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='Other',pattern_id='different' WHERE rowid=5"}, {name: "EmptyIsDistinct", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='' WHERE rowid=5", count: 1},
	})
}
