package levels_test

import (
	"main/services"
	"main/types"
	levels "main/validations/levels"
	testutils "main/validations/levels/utils"
	"testing"
)

func TestRowLocalDependencies(t *testing.T) {
	const presence = "levels_level_name_field"
	const value = "levels_level_index_valid"
	config := testutils.Config(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := testutils.Fixture(t, map[string]any{"level_name": "", "level_index": "bad"}, config)
	if _, err := db.Exec("INSERT INTO levels(level_name,level_index) VALUES ('Ground','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	levels.RunValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
	for _, id := range []string{presence, value} {
		if got := services.AppMessageService.RuleIssueCount(id); got != 1 {
			t.Fatalf("%s: %d", id, got)
		}
	}
	for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
		want := 5
		if msg.RuleID == value {
			want = 6
		}
		if len(msg.Rows) != 1 || msg.Rows[0] != want {
			t.Fatalf("wrong row: %+v", msg)
		}
	}
}
func TestMalformedIndexDoesNotSuppressDuplicateCheck(t *testing.T) {
	config := testutils.Config("levels_level_index_valid", types.SEVERITY_ERROR)
	config.SetRule("levels_level_id_unique", types.RuleContext{Severity: types.SEVERITY_ERROR})
	db, _ := testutils.Fixture(t, map[string]any{"level_id": "A", "level_index": "bad"}, config)
	if _, err := db.Exec("INSERT INTO levels(level_id,level_index) VALUES ('A','1')"); err != nil {
		t.Fatal(err)
	}
	levels.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
	if got := services.AppMessageService.RuleIssueCount("levels_level_id_unique"); got != 2 {
		t.Fatalf("duplicates: %d", got)
	}
	if got := services.AppMessageService.RuleIssueCount("levels_level_index_valid"); got != 1 {
		t.Fatalf("indices: %d", got)
	}
}
func TestRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"levels_level_id_field", "level_id", ""},
		{"levels_level_index_field", "level_index", ""},
		{"levels_level_name_field", "level_name", ""},
		{"levels_level_id_unique", "level_id", "A"},
		{"levels_level_index_valid", "level_index", "bad"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			db, _ := testutils.Fixture(t, map[string]any{tc.field: tc.value}, config)
			count := uint64(1)
			if tc.id == "levels_level_id_unique" {
				if _, err := db.Exec("INSERT INTO levels(level_id) VALUES ('A')"); err != nil {
					t.Fatal(err)
				}
				count = 2
			}
			levels.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
			if got := services.AppMessageService.RuleIssueCount(tc.id); got != count {
				t.Fatalf("findings=%d, want %d", got, count)
			}
		})
	}
}
