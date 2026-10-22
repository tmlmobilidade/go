package frequencies_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/frequencies/standard/checks"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestTripIdValid(t *testing.T) {
	const id = "frequencies_trip_id_references_trips_table"
	for _, tc := range []struct {
		value any
		count int
	}{{"A", 0}, {"trip'quoted", 0}, {"missing", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"trip_id": tc.value}, config)
			if err := checks.TripIdValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.TripIdValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "trip_id", checks.TripIdValid, map[string]any{"trip_id": "bad"})
}
func TestTripReferenceReadsCurrentSQLite(t *testing.T) {
	const id = "frequencies_trip_id_references_trips_table"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"trip_id": "A"}, config)
	if err := checks.TripIdValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("DELETE FROM trips"); err != nil {
		t.Fatal(err)
	}
	if err := checks.TripIdValid(ctx, config.Rule(id)); err != nil {
		t.Fatal(err)
	}
	testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 1)
}
func TestMissingTripsTableReturnsError(t *testing.T) {
	const id = "frequencies_trip_id_references_trips_table"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, ctx := testutils.Fixture(t, map[string]any{"trip_id": "A"}, config)
	if _, err := db.Exec("DROP TABLE trips"); err != nil {
		t.Fatal(err)
	}
	if err := checks.TripIdValid(ctx, config.Rule(id)); err == nil {
		t.Fatal("SQLite error swallowed")
	}
	testutils.AssertFindings(t, id, "trip_id", types.SEVERITY_ERROR, 0)
}
