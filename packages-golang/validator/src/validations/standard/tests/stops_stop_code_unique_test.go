package standard_test

import (
	"database/sql"
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestStopCodeUnique(t *testing.T) {
	insert := func(value any) func(*sql.DB) {
		return func(db *sql.DB) {
			if _, err := db.Exec("INSERT INTO stops (rowid, stop_code) VALUES (8, ?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	validationutils.StopsCheckCases(t, "stops_stop_code_unique", "stop_code", standard.StopCodeUnique, []validationutils.StopsCase{
		{Name: "Unique", Values: map[string]any{"stop_code": "station"}},
		{Name: "Duplicate", Values: map[string]any{"stop_code": "station"}, Count: 1, Setup: insert("station")},
		{Name: "CaseSensitive", Values: map[string]any{"stop_code": "station"}, Setup: insert("STATION")},
		{Name: "QuotedID", Values: map[string]any{"stop_code": "O'Brien"}, Count: 1, Setup: insert("O'Brien")},
		{Name: "SQLIsLiteral", Values: map[string]any{"stop_code": "' OR 1=1 --"}, Setup: insert("station")},
		{Name: "Empty", Values: map[string]any{"stop_code": ""}, Count: 1, Setup: insert("")},
		{Name: "NullsAreNotEqual", Values: map[string]any{"stop_code": nil}, Setup: insert(nil)},
		{Name: "MissingColumn", Values: map[string]any{}},
	})
	t.Run("ReadsCurrentSQLiteValues", func(t *testing.T) {
		config := validationutils.StopsConfig("stops_stop_code_unique", types.SEVERITY_ERROR)
		connection, db := validationutils.StopsFixture(t, map[string]any{"stop_code": "first"}, config, insert("second"))
		if err := standard.StopCodeUnique(db, config.Rule("stops_stop_code_unique")); err != nil {
			t.Fatal(err)
		}
		validationutils.StopsAssertFindings(t, "stops_stop_code_unique", "stop_code", types.SEVERITY_ERROR, 0)
		if _, err := connection.Exec(fmt.Sprintf("UPDATE stops SET %q = ? WHERE rowid = 8", "stop_code"), "first"); err != nil {
			t.Fatal(err)
		}
		if err := standard.StopCodeUnique(db, config.Rule("stops_stop_code_unique")); err != nil {
			t.Fatal(err)
		}
		validationutils.StopsAssertFindings(t, "stops_stop_code_unique", "stop_code", types.SEVERITY_ERROR, 1)
	})

}
