package stops_standard_test

import (
	"database/sql"
	"fmt"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	checks "main/validations/stops/standard/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestParentStationForeign(t *testing.T) {
	insert := func(value any) func(*sql.DB) {
		return func(db *sql.DB) {
			if _, err := db.Exec("INSERT INTO stops (rowid, parent_station) VALUES (8, ?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	// Current behavior: the parent value overrides the rule ID, so configured execution suppresses duplicate findings.
	testutils.CheckCases(t, "stops_parent_station_foreign", "parent_station", checks.ParentStationForeign, []testutils.Case{
		{Name: "UnreferencedParentCurrentlyAccepted", Values: map[string]any{"parent_station": "station"}},
		{Name: "Duplicate", Values: map[string]any{"parent_station": "station"}, Setup: insert("station")},
		{Name: "CaseSensitive", Values: map[string]any{"parent_station": "station"}, Setup: insert("STATION")},
		{Name: "QuotedID", Values: map[string]any{"parent_station": "O'Brien"}, Setup: insert("O'Brien")},
		{Name: "SQLIsLiteral", Values: map[string]any{"parent_station": "' OR 1=1 --"}, Setup: insert("station")},
		{Name: "Empty", Values: map[string]any{"parent_station": ""}, Setup: insert("")},
		{Name: "NullsAreNotEqual", Values: map[string]any{"parent_station": nil}, Setup: insert(nil)},
		{Name: "MissingColumn", Values: map[string]any{}},
	})
	t.Run("ReadsCurrentSQLiteValues", func(t *testing.T) {
		config := testutils.Config("stops_parent_station_foreign", types.SEVERITY_ERROR)
		connection, db := testutils.Fixture(t, map[string]any{"parent_station": "first"}, config, insert("second"))
		ruleset.ConfigureMessageSeverities(nil)
		if err := checks.ParentStationForeign(db, config.Rule("stops_parent_station_foreign")); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, "first", "parent_station", types.SEVERITY_ERROR, 0)
		if _, err := connection.Exec(fmt.Sprintf("UPDATE stops SET %q = ? WHERE rowid = 8", "parent_station"), "first"); err != nil {
			t.Fatal(err)
		}
		if err := checks.ParentStationForeign(db, config.Rule("stops_parent_station_foreign")); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, "first", "parent_station", types.SEVERITY_ERROR, 1)
	})

	t.Run("CurrentStandaloneRuleIDOverride", func(t *testing.T) {
		_, db := testutils.Fixture(t, map[string]any{"parent_station": "station"}, nil, insert("station"))
		ruleset.ConfigureMessageSeverities(nil)
		if err := checks.ParentStationForeign(db, &types.RuleContext{Severity: types.SEVERITY_ERROR}); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, "station", "parent_station", types.SEVERITY_ERROR, 1)
		if services.AppMessageService.RuleIssueCount("stops_parent_station_foreign") != 0 {
			t.Fatal("unexpected attribution to the configured rule")
		}
	})
}
