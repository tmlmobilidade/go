package standard_test

import (
	"database/sql"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLevelIdForeign(t *testing.T) {
	setup := func(db *sql.DB) {
		if _, err := db.Exec("CREATE TABLE levels (level_id TEXT)"); err != nil {
			t.Fatal(err)
		}
		for _, value := range []string{"found", "O'Brien"} {
			if _, err := db.Exec("INSERT INTO levels VALUES (?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	validationutils.StopsCheckCases(t, "stops_level_id_foreign", "level_id", standard.LevelIdForeign, []validationutils.StopsCase{
		{Name: "Found", Values: map[string]any{"level_id": "found"}},
		{Name: "QuotedID", Values: map[string]any{"level_id": "O'Brien"}},
		{Name: "MissingID", Values: map[string]any{"level_id": "absent"}, Count: 1},
		{Name: "CaseSensitive", Values: map[string]any{"level_id": "FOUND"}, Count: 1},
		{Name: "SQLIsLiteral", Values: map[string]any{"level_id": "' OR 1=1 --"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"level_id": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"level_id": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	}, setup)
	t.Run("MissingReferenceTable", func(t *testing.T) {
		validationutils.StopsCheckCases(t, "stops_level_id_foreign", "level_id", standard.LevelIdForeign, []validationutils.StopsCase{
			{Name: "Missing", Values: map[string]any{"level_id": "found"}, Count: 1},
		})
	})
	t.Run("MissingReferenceColumn", func(t *testing.T) {
		validationutils.StopsCheckCases(t, "stops_level_id_foreign", "level_id", standard.LevelIdForeign, []validationutils.StopsCase{
			{Name: "Missing", Values: map[string]any{"level_id": "found"}, Count: 1},
		}, func(db *sql.DB) {
			if _, err := db.Exec("CREATE TABLE levels (other TEXT)"); err != nil {
				t.Fatal(err)
			}
		})
	})

}
