package stops_standard_test

import (
	"database/sql"
	"fmt"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"main/types"
	"testing"
)

func TestStopIdUnique(t *testing.T) {
	insert := func(value any) func(*sql.DB) {
		return func(db *sql.DB) {
			if _, err := db.Exec("INSERT INTO stops (rowid, stop_id) VALUES (8, ?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	testutils.CheckCases(t, "stops_stop_id_unique", "stop_id", checks.StopIdUnique, []testutils.Case{
		{Name: "Unique", Values: map[string]any{"stop_id": "station"}},
		{Name: "Duplicate", Values: map[string]any{"stop_id": "station"}, Count: 1, Setup: insert("station")},
		{Name: "CaseSensitive", Values: map[string]any{"stop_id": "station"}, Setup: insert("STATION")},
		{Name: "QuotedID", Values: map[string]any{"stop_id": "O'Brien"}, Count: 1, Setup: insert("O'Brien")},
		{Name: "SQLIsLiteral", Values: map[string]any{"stop_id": "' OR 1=1 --"}, Setup: insert("station")},
		{Name: "Empty", Values: map[string]any{"stop_id": ""}, Count: 1, Setup: insert("")},
		{Name: "NullsAreNotEqual", Values: map[string]any{"stop_id": nil}, Setup: insert(nil)},
		{Name: "MissingColumn", Values: map[string]any{}},
	})
	t.Run("ReadsCurrentSQLiteValues", func(t *testing.T) {
		config := testutils.Config("stops_stop_id_unique", types.SEVERITY_ERROR)
		connection, db := testutils.Fixture(t, map[string]any{"stop_id": "first"}, config, insert("second"))
		if err := checks.StopIdUnique(db, config.Rule("stops_stop_id_unique")); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, "stops_stop_id_unique", "stop_id", types.SEVERITY_ERROR, 0)
		if _, err := connection.Exec(fmt.Sprintf("UPDATE stops SET %q = ? WHERE rowid = 8", "stop_id"), "first"); err != nil {
			t.Fatal(err)
		}
		if err := checks.StopIdUnique(db, config.Rule("stops_stop_id_unique")); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, "stops_stop_id_unique", "stop_id", types.SEVERITY_ERROR, 1)
	})

}
