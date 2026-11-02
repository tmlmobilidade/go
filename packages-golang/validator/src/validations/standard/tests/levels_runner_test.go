package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestLevelsRowLocalDependencies(t *testing.T) {
	const presence = "levels_level_name_field"
	const value = "levels_level_index_valid"
	config := validationutils.LevelsConfig(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := validationutils.LevelsFixture(t, map[string]any{"level_name": "", "level_index": "bad"}, config)
	if _, err := db.Exec("INSERT INTO levels(level_name,level_index) VALUES ('Ground','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	validations.RunLevelsValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
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
	config := validationutils.LevelsConfig("levels_level_index_valid", types.SEVERITY_ERROR)
	config.SetRule("levels_level_id_unique", types.RuleContext{Severity: types.SEVERITY_ERROR})
	db, _ := validationutils.LevelsFixture(t, map[string]any{"level_id": "A", "level_index": "bad"}, config)
	if _, err := db.Exec("INSERT INTO levels(level_id,level_index) VALUES ('A','1')"); err != nil {
		t.Fatal(err)
	}
	validations.RunLevelsValidations(*types.NewGtfsFromSQLite(db, ""), config)
	if got := services.AppMessageService.RuleIssueCount("levels_level_id_unique"); got != 2 {
		t.Fatalf("duplicates: %d", got)
	}
	if got := services.AppMessageService.RuleIssueCount("levels_level_index_valid"); got != 1 {
		t.Fatalf("indices: %d", got)
	}
}
func TestLevelsRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"levels_level_id_field", "level_id", ""},
		{"levels_level_index_field", "level_index", ""},
		{"levels_level_name_field", "level_name", ""},
		{"levels_level_id_unique", "level_id", "A"},
		{"levels_level_index_valid", "level_index", "bad"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := validationutils.LevelsConfig(tc.id, types.SEVERITY_ERROR)
			db, _ := validationutils.LevelsFixture(t, map[string]any{tc.field: tc.value}, config)
			count := uint64(1)
			if tc.id == "levels_level_id_unique" {
				if _, err := db.Exec("INSERT INTO levels(level_id) VALUES ('A')"); err != nil {
					t.Fatal(err)
				}
				count = 2
			}
			validations.RunLevelsValidations(*types.NewGtfsFromSQLite(db, ""), config)
			if got := services.AppMessageService.RuleIssueCount(tc.id); got != count {
				t.Fatalf("findings=%d, want %d", got, count)
			}
		})
	}
}
