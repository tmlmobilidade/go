package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestTripHeadsignPatternConsistent(t *testing.T) {
	runCases(t, "trip_headsign_consistent_for_all_patterns_in_trips", "trip_headsign", "trips.txt", checks.TripHeadsignPatternConsistent, []scenario{
		{name: "OneTrip"}, {name: "Identical", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; "}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='Other' WHERE rowid=5", count: 1}, {name: "OtherPattern", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='Other',pattern_id='different' WHERE rowid=5"}, {name: "EmptyIsDistinct", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='' WHERE rowid=5", count: 1},
	})
}
