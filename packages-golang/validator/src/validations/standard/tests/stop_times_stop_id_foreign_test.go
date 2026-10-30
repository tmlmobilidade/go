package standard_test

import (
	"database/sql"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopIdForeign(t *testing.T) {
	const id = "stop_times_stop_id_foreign"
	setup := func(db *sql.DB) {
		if _, err := db.Exec("CREATE TABLE stops (stop_id TEXT)"); err != nil {
			t.Fatal(err)
		}
		for _, value := range []string{"found", "O'Brien"} {
			if _, err := db.Exec("INSERT INTO stops VALUES (?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	validationutils.StopTimesCheckCases(t, id, "stop_id", standard.StopIdForeign, []validationutils.StopTimesCase{
		{Name: "Found", Values: map[string]any{"stop_id": "found"}},
		{Name: "QuotedID", Values: map[string]any{"stop_id": "O'Brien"}},
		{Name: "MissingID", Values: map[string]any{"stop_id": "absent"}, Count: 1},
		{Name: "CaseSensitive", Values: map[string]any{"stop_id": "FOUND"}, Count: 1},
		{Name: "SQLIsLiteral", Values: map[string]any{"stop_id": "' OR 1=1 --"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"stop_id": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"stop_id": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	}, setup)
	t.Run("MissingReferenceTable", func(t *testing.T) {
		validationutils.StopTimesCheckCases(t, id, "stop_id", standard.StopIdForeign, []validationutils.StopTimesCase{
			{Name: "Missing", Values: map[string]any{"stop_id": "found"}, Count: 1},
		})
	})
}
