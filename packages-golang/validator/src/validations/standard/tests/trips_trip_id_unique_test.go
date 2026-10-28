package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTripIdUnique(t *testing.T) {
	const id = "trips_trip_id_unique"
	config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
	db, ctx := validationutils.TripsFixture(t, map[string]any{"trip_id": "T1"}, config)
	if err := standard.TripIdUnique(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.TripsAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
	if _, err := db.Exec("INSERT INTO trips (trip_id) VALUES ('T1')"); err != nil {
		t.Fatal(err)
	}
	if err := standard.TripIdUnique(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	validationutils.TripsAssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 1)
}
func TestTripIdUniqueReadFailure(t *testing.T) {
	validationutils.TripsAssertReadFailure(t, standard.TripIdUnique, "trips_trip_id_unique")
}
