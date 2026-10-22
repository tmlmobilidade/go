package pathways_test

import (
	"main/services"
	"main/types"
	pathways "main/validations/pathways"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestRowLocalDependencies(t *testing.T) {
	const presence = "pathways_pathway_mode_field"
	const value = "pathways_traversal_time_valid"
	config := testutils.Config(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := testutils.Fixture(t, map[string]any{"pathway_mode": "", "traversal_time": "bad"}, config)
	if _, err := db.Exec("INSERT INTO pathways(pathway_mode,traversal_time) VALUES ('1','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	pathways.RunValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
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
func TestMalformedValueDoesNotSkipOtherChecks(t *testing.T) {
	ids := []string{"pathways_traversal_time_valid", "pathways_pathway_mode_valid", "pathways_from_stop_id_foreign"}
	config := &types.GtfsRules{}
	for _, id := range ids {
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR})
	}
	db, _ := testutils.Fixture(t, map[string]any{"traversal_time": "bad", "pathway_mode": "0", "from_stop_id": "missing"}, config)
	pathways.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
	for _, id := range ids {
		if got := services.AppMessageService.RuleIssueCount(id); got != 1 {
			t.Fatalf("%s: %d", id, got)
		}
	}
}
func TestRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"pathways_max_slope_field", "max_slope", ""},
		{"pathways_traversal_time_field", "traversal_time", ""},
		{"pathways_to_stop_id_field", "to_stop_id", ""},
		{"pathways_length_field", "length", ""},
		{"pathways_min_width_field", "min_width", ""},
		{"pathways_reversed_signposted_as_field", "reversed_signposted_as", ""},
		{"pathways_stair_count_field", "stair_count", ""},
		{"pathways_from_stop_id_field", "from_stop_id", ""},
		{"pathways_pathway_id_field", "pathway_id", ""},
		{"pathways_is_bidirectional_field", "is_bidirectional", ""},
		{"pathways_signposted_as_field", "signposted_as", ""},
		{"pathways_pathway_mode_field", "pathway_mode", ""},
		{"pathways_max_slope_valid", "max_slope", "bad"},
		{"pathways_traversal_time_valid", "traversal_time", "bad"},
		{"pathways_to_stop_id_foreign", "to_stop_id", "bad"},
		{"pathways_length_valid", "length", "bad"},
		{"pathways_min_width_valid", "min_width", "bad"},
		{"pathways_stair_count_valid", "stair_count", "bad"},
		{"pathways_from_stop_id_foreign", "from_stop_id", "bad"},
		{"pathways_pathway_id_unique", "pathway_id", "A"},
		{"pathways_is_bidirectional_valid", "is_bidirectional", "bad"},
		{"pathways_pathway_mode_valid", "pathway_mode", "bad"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			values := map[string]any{"pathway_mode": "2"}
			values[tc.field] = tc.value
			db, _ := testutils.Fixture(t, values, config)
			count := uint64(1)
			if tc.id == "pathways_pathway_id_unique" {
				if _, err := db.Exec("INSERT INTO pathways(pathway_id) VALUES ('A')"); err != nil {
					t.Fatal(err)
				}
				count = 2
			}
			pathways.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
			if got := services.AppMessageService.RuleIssueCount(tc.id); got != count {
				t.Fatalf("findings=%d, want %d", got, count)
			}
		})
	}
}
