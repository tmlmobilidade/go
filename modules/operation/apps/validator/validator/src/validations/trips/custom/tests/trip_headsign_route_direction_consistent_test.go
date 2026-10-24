package trips_custom_test

import (
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestTripHeadsignRouteDirectionConsistent(t *testing.T) {
	runCases(t, "trips_trip_headsign_route_direction_consistent", "trip_headsign", "trips.txt", checks.TripHeadsignRouteDirectionConsistent, []scenario{
		{name: "One"}, {name: "SameDirectionMismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='other' WHERE rowid=5", count: 1}, {name: "OppositeDirection", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='other',direction_id='1' WHERE rowid=5"}, {name: "InvalidDirection", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='other',direction_id='2' WHERE rowid=5"},
	})
}
