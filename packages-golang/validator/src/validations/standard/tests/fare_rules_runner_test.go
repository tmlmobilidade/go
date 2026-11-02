package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestFareRulesRowLocalDependencies(t *testing.T) {
	const presence = "fare_rules_fare_id_field"
	const value = "fare_rules_route_id_foreign"
	config := validationutils.FareRulesConfig(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := validationutils.FareRulesFixture(t, map[string]any{"fare_id": "", "route_id": "missing"}, config)
	if _, err := db.Exec("INSERT INTO fare_rules(fare_id,route_id) VALUES ('A','missing')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	validations.RunFareRulesValidations(*types.NewGtfsFromSQLite(db, ""), config, tables)
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
func TestFareRulesRunnerRegistersEveryCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"fare_rules_fare_id_field", "fare_id", ""},
		{"fare_rules_fare_id_foreign", "fare_id", "missing"},
		{"fare_rules_route_id_field", "route_id", ""},
		{"fare_rules_route_id_foreign", "route_id", "missing"},
		{"fare_rules_origin_id_field", "origin_id", ""},
		{"fare_rules_origin_id_foreign", "origin_id", "missing"},
		{"fare_rules_destination_id_field", "destination_id", ""},
		{"fare_rules_destination_id_foreign", "destination_id", "missing"},
		{"fare_rules_contains_id_field", "contains_id", ""},
		{"fare_rules_contains_id_foreign", "contains_id", "missing"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := validationutils.FareRulesConfig(tc.id, types.SEVERITY_ERROR)
			db, _ := validationutils.FareRulesFixture(t, map[string]any{tc.field: tc.value}, config)
			validations.RunFareRulesValidations(*types.NewGtfsFromSQLite(db, ""), config)
			validationutils.FareRulesAssertFindings(t, tc.id, tc.field, types.SEVERITY_ERROR, 1)
		})
	}
}
func TestEmptyRowStillRunsPresenceChecks(t *testing.T) {
	const id = "fare_rules_fare_id_field"
	config := validationutils.FareRulesConfig(id, types.SEVERITY_ERROR)
	db, _ := validationutils.FareRulesFixture(t, nil, config)
	validations.RunFareRulesValidations(*types.NewGtfsFromSQLite(db, ""), config)
	validationutils.FareRulesAssertFindings(t, id, "fare_id", types.SEVERITY_ERROR, 1)
}
