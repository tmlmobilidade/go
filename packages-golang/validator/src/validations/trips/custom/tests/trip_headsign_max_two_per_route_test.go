package trips_custom_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/custom/checks"
	"testing"
)

func TestTripHeadsignMaxTwoPerRoute(t *testing.T) {
	runCases(t, "trips_trip_headsign_max_two_per_route", "trip_headsign", "trips.txt", checks.TripHeadsignMaxTwoPerRoute, []scenario{
		{name: "One"}, {name: "Two", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='second' WHERE rowid=5"}, {name: "Three", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET trip_headsign='second' WHERE rowid=5;UPDATE trips SET trip_headsign='third' WHERE rowid=6", count: 1},
	})
}
