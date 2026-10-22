package frequencies_test

import (
	"main/services"
	"main/types"
	frequencies "main/validations/frequencies"
	testutils "main/validations/frequencies/utils"
	"testing"
)

func TestRowLocalDependencies(t *testing.T) {
	const presence = "frequencies_trip_id_field"
	const value = "frequencies_headway_secs_valid"
	config := testutils.Config(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := testutils.Fixture(t, map[string]any{"trip_id": "", "headway_secs": "bad"}, config)
	if _, err := db.Exec("INSERT INTO frequencies(trip_id,headway_secs) VALUES ('A','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	frequencies.RunValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
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
func TestMalformedValueDoesNotSuppressIndependentChecks(t *testing.T) {
	ids := []string{"frequencies_start_time_valid", "frequencies_headway_secs_valid", "frequencies_exact_times_valid", "frequencies_trip_id_foreign"}
	config := &types.GtfsRules{}
	for _, id := range ids {
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR})
	}
	db, _ := testutils.Fixture(t, map[string]any{"trip_id": "missing", "start_time": "bad", "headway_secs": "bad", "exact_times": "bad"}, config)
	frequencies.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
	for _, id := range ids {
		if got := services.AppMessageService.RuleIssueCount(id); got != 1 {
			t.Fatalf("%s: %d", id, got)
		}
	}
}
func TestRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"frequencies_trip_id_field", "trip_id", ""},
		{"frequencies_trip_id_foreign", "trip_id", "bad"},
		{"frequencies_exact_times_field", "exact_times", ""},
		{"frequencies_exact_times_valid", "exact_times", "bad"},
		{"frequencies_headway_secs_field", "headway_secs", ""},
		{"frequencies_headway_secs_valid", "headway_secs", "bad"},
		{"frequencies_end_time_field", "end_time", ""},
		{"frequencies_end_time_valid", "end_time", "bad"},
		{"frequencies_start_time_field", "start_time", ""},
		{"frequencies_start_time_valid", "start_time", "bad"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			db, _ := testutils.Fixture(t, map[string]any{tc.field: tc.value}, config)
			frequencies.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
			testutils.AssertFindings(t, tc.id, tc.field, types.SEVERITY_ERROR, 1)
		})
	}
}
