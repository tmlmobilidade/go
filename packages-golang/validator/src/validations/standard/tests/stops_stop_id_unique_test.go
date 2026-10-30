package standard_test

import (
	"database/sql"
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
	validationutils.StopsCheckCases(t, "stops_stop_id_unique", "stop_id", standard.StopIdUnique, []validationutils.StopsCase{
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
		config := validationutils.StopsConfig("stops_stop_id_unique", types.SEVERITY_ERROR)
		connection, db := validationutils.StopsFixture(t, map[string]any{"stop_id": "first"}, config, insert("second"))
		if err := standard.StopIdUnique(db, config.Rule("stops_stop_id_unique")); err != nil {
			t.Fatal(err)
		}
		validationutils.StopsAssertFindings(t, "stops_stop_id_unique", "stop_id", types.SEVERITY_ERROR, 0)
		if _, err := connection.Exec(fmt.Sprintf("UPDATE stops SET %q = ? WHERE rowid = 8", "stop_id"), "first"); err != nil {
			t.Fatal(err)
		}
		if err := standard.StopIdUnique(db, config.Rule("stops_stop_id_unique")); err != nil {
			t.Fatal(err)
		}
		validationutils.StopsAssertFindings(t, "stops_stop_id_unique", "stop_id", types.SEVERITY_ERROR, 1)
	})

}
