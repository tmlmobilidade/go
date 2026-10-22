package trips_standard_test

import (
	"main/types"
	checks "main/validations/trips/standard/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestTripIdUnique(t *testing.T) {
	const id = "trips_trip_id_unique"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"trip_id": "T1"}, config)
	if err := checks.TripIdUnique(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("INSERT INTO trips (trip_id) VALUES ('T1')"); err != nil {
		t.Fatal(err)
	}
	if err := checks.TripIdUnique(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 1)
}
func TestTripIdUniqueReadFailure(t *testing.T) {
	testutils.AssertReadFailure(t, checks.TripIdUnique, "trips_trip_id_unique")
}
