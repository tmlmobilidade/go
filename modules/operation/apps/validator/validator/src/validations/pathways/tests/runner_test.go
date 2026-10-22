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
	const value = "pathway_traversal_time_non_negative_seconds"
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
	ids := []string{"pathway_traversal_time_non_negative_seconds", "pathway_mode_valid_gtfs_enum", "pathway_from_stop_id_references_stops_table"}
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
		{"pathway_max_slope_allowed_for_pathway_mode", "max_slope", "bad"},
		{"pathway_traversal_time_non_negative_seconds", "traversal_time", "bad"},
		{"pathway_to_stop_id_references_stops_table", "to_stop_id", "bad"},
		{"pathway_length_non_negative", "length", "bad"},
		{"pathway_min_width_positive", "min_width", "bad"},
		{"pathway_stair_count", "stair_count", "bad"},
		{"pathway_from_stop_id_references_stops_table", "from_stop_id", "bad"},
		{"pathway_id_unique", "pathway_id", "A"},
		{"pathway_is_bidirectional_valid_gtfs_enum", "is_bidirectional", "bad"},
		{"pathway_mode_valid_gtfs_enum", "pathway_mode", "bad"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			values := map[string]any{"pathway_mode": "2"}
			values[tc.field] = tc.value
			db, _ := testutils.Fixture(t, values, config)
			count := uint64(1)
			if tc.id == "pathway_id_unique" {
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
