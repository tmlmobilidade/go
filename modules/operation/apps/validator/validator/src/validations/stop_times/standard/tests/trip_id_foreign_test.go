package stop_times_standard_test

import (
	"database/sql"
	checks "main/validations/stop_times/standard/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestTripIdForeign(t *testing.T) {
	const id = "stop_times_trip_id_foreign"
	setup := func(db *sql.DB) {
		if _, err := db.Exec("CREATE TABLE trips (trip_id TEXT)"); err != nil {
			t.Fatal(err)
		}
		for _, value := range []string{"found", "O'Brien"} {
			if _, err := db.Exec("INSERT INTO trips VALUES (?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	testutils.CheckCases(t, id, "trip_id", checks.TripIdForeign, []testutils.Case{
		{Name: "Found", Values: map[string]any{"trip_id": "found"}},
		{Name: "QuotedID", Values: map[string]any{"trip_id": "O'Brien"}},
		{Name: "MissingID", Values: map[string]any{"trip_id": "absent"}, Count: 1},
		{Name: "CaseSensitive", Values: map[string]any{"trip_id": "FOUND"}, Count: 1},
		{Name: "SQLIsLiteral", Values: map[string]any{"trip_id": "' OR 1=1 --"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"trip_id": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"trip_id": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	}, setup)
	t.Run("MissingReferenceTable", func(t *testing.T) {
		testutils.CheckCases(t, id, "trip_id", checks.TripIdForeign, []testutils.Case{
			{Name: "Missing", Values: map[string]any{"trip_id": "found"}, Count: 1},
		})
	})
}
