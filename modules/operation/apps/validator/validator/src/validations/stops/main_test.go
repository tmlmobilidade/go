package stops_test

import (
	"database/sql"
	"main/services"
	"main/types"
	registry "main/validations"
	stops "main/validations/stops"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestRunValidationsDependenciesAreRowLocal(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE} {
		for _, prepared := range []bool{false, true} {
			name := string(severity) + "/unprepared"
			if prepared {
				name = string(severity) + "/prepared"
			}
			t.Run(name, func(t *testing.T) {
				config := &types.GtfsRules{
					"stops_stop_id_field":  {Severity: severity},
					"stops_stop_id_unique": {Severity: types.SEVERITY_ERROR, DependsOn: []string{"stops_stop_id_field"}},
				}
				connection, _ := testutils.Fixture(t, map[string]any{"stop_id": ""}, config, func(db *sql.DB) {
					if _, err := db.Exec("INSERT INTO stops (rowid, stop_id) VALUES (5, ''), (6, 'duplicate'), (7, 'duplicate'), (8, 'unique')"); err != nil {
						t.Fatal(err)
					}
				})
				gtfs := types.NewGtfsFromSQLite(connection, "")
				if prepared {
					tables, err := services.PrepareSQLiteTables(connection)
					if err != nil {
						t.Fatal(err)
					}
					run, ok := registry.Get("stops")
					if !ok {
						t.Fatal("stops validator is not registered")
					}
					run(*gtfs, config, tables)
				} else {
					stops.RunValidations(*gtfs, config)
				}
				expected := uint64(2)
				if severity == types.SEVERITY_IGNORE {
					expected = 0
				}
				for _, id := range []string{"stops_stop_id_field", "stops_stop_id_unique"} {
					if got := services.AppMessageService.RuleIssueCount(id); got != expected {
						t.Fatalf("%s: findings = %d, want %d", id, got, expected)
					}
				}
				for _, message := range services.AppMessageService.GetSummary().AllMessages() {
					wantSeverity := severity
					wantRows := []int{5, 6}
					if message.RuleID == "stops_stop_id_unique" {
						wantSeverity = types.SEVERITY_ERROR
						wantRows = []int{7, 8}
					} else if message.RuleID != "stops_stop_id_field" {
						t.Fatalf("unexpected rule: %+v", message)
					}
					if message.Severity != wantSeverity || message.Field != "stop_id" || message.FileName != "stops.txt" || len(message.Rows) != 2 {
						t.Fatalf("unexpected finding: %+v", message)
					}
					for i, row := range message.Rows {
						if row != wantRows[i] {
							t.Fatalf("unexpected source rows: got %v, want %v", message.Rows, wantRows)
						}
					}
				}
			})
		}
	}
}
