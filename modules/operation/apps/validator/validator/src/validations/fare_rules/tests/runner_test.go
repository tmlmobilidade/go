package fare_rules_test

import (
	"main/services"
	"main/types"
	fare_rules "main/validations/fare_rules"
	testutils "main/validations/fare_rules/utils"
	"testing"
)

func TestRowLocalDependencies(t *testing.T) {
	const presence = "fare_rules_fare_id_field"
	const value = "fare_rule_route_id_references_routes"
	config := testutils.Config(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := testutils.Fixture(t, map[string]any{"fare_id": "", "route_id": "missing"}, config)
	if _, err := db.Exec("INSERT INTO fare_rules(fare_id,route_id) VALUES ('A','missing')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	fare_rules.RunValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
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
func TestRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"fare_rules_fare_id_field", "fare_id", ""},
		{"fare_rule_fare_id_references_fare_attributes", "fare_id", "missing"},
		{"fare_rules_route_id_field", "route_id", ""},
		{"fare_rule_route_id_references_routes", "route_id", "missing"},
		{"fare_rules_origin_id_field", "origin_id", ""},
		{"fare_rule_origin_id_references_zones_stops", "origin_id", "missing"},
		{"fare_rules_destination_id_field", "destination_id", ""},
		{"fare_rule_destination_id_references_zones_stops", "destination_id", "missing"},
		{"fare_rules_contains_id_field", "contains_id", ""},
		{"fare_rule_contains_id_references_zones_stops", "contains_id", "missing"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			db, _ := testutils.Fixture(t, map[string]any{tc.field: tc.value}, config)
			fare_rules.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
			testutils.AssertFindings(t, tc.id, tc.field, types.SEVERITY_ERROR, 1)
		})
	}
}
func TestEmptyRowStillRunsPresenceChecks(t *testing.T) {
	const id = "fare_rules_fare_id_field"
	config := testutils.Config(id, types.SEVERITY_ERROR)
	db, _ := testutils.Fixture(t, nil, config)
	fare_rules.RunValidations(*types.NewGtfsFromSQLite(db, ""), config)
	testutils.AssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 1)
}
