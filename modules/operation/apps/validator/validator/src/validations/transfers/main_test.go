package transfers_test

import (
	"main/services"
	"main/types"
	transfers "main/validations/transfers"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestPresenceDependenciesAreRowLocal(t *testing.T) {
	const presence = "transfers_from_stop_id_field"
	const value = "transfers_min_transfer_time_non_negative_seconds"
	config := testutils.Config(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := testutils.Fixture(t, map[string]any{"from_stop_id": "", "transfer_type": "2", "min_transfer_time": "bad"}, config)
	if _, err := db.Exec("INSERT INTO transfers(from_stop_id,transfer_type,min_transfer_time) VALUES ('A','2','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	transfers.RunValidations(*gtfs, config, tables)
	if got := services.AppMessageService.RuleIssueCount(presence); got != 1 {
		t.Fatalf("presence findings=%d", got)
	}
	if got := services.AppMessageService.RuleIssueCount(value); got != 1 {
		t.Fatalf("value findings=%d", got)
	}
	for _, message := range services.AppMessageService.GetSummary().AllMessages() {
		expectedRow := 5
		if message.RuleID == value {
			expectedRow = 6
		}
		if len(message.Rows) != 1 || message.Rows[0] != expectedRow {
			t.Fatalf("wrong row: %+v", message)
		}
	}
}

func TestMalformedTimeDoesNotSkipUnrelatedChecks(t *testing.T) {
	const timeRule = "transfers_min_transfer_time_non_negative_seconds"
	const stopRule = "transfer_from_stop_id_references_stops_table"
	config := testutils.Config(timeRule, types.SEVERITY_ERROR)
	config.SetRule(stopRule, types.RuleContext{Severity: types.SEVERITY_ERROR})
	db, _ := testutils.Fixture(t, map[string]any{"from_stop_id": "unknown", "min_transfer_time": "bad"}, config)
	gtfs := types.NewGtfsFromSQLite(db, "")
	transfers.RunValidations(*gtfs, config)
	for _, id := range []string{timeRule, stopRule} {
		if got := services.AppMessageService.RuleIssueCount(id); got != 1 {
			t.Fatalf("%s findings=%d, want 1", id, got)
		}
	}
}

func TestRunnerRegistersEveryTransferCheck(t *testing.T) {
	for _, tc := range []struct{ id, field, value string }{
		{"transfers_from_stop_id_field", "from_stop_id", ""},
		{"transfers_to_stop_id_field", "to_stop_id", ""},
		{"transfers_from_route_id_field", "from_route_id", ""},
		{"transfers_to_route_id_field", "to_route_id", ""},
		{"transfers_from_trip_id_field", "from_trip_id", ""},
		{"transfers_to_trip_id_field", "to_trip_id", ""},
		{"transfers_transfer_type_field", "transfer_type", ""},
		{"transfers_min_transfer_time_field", "min_transfer_time", ""},
		{"transfer_from_stop_id_references_stops_table", "from_stop_id", "missing"},
		{"transfer_from_route_id_references_routes_table", "from_route_id", "missing"},
		{"transfer_from_trip_id_references_trips_table", "from_trip_id", "missing"},
		{"transfer_to_stop_id_references_stops_table", "to_stop_id", "missing"},
		{"transfer_to_route_id_references_routes_table", "to_route_id", "missing"},
		{"transfer_to_trip_id_references_trips_table", "to_trip_id", "missing"},
		{"transfer_type_valid_gtfs_enum", "transfer_type", "missing"},
		{"transfers_min_transfer_time_non_negative_seconds", "min_transfer_time", "missing"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := testutils.Config(tc.id, types.SEVERITY_ERROR)
			values := map[string]any{"transfer_type": "2"}
			values[tc.field] = tc.value
			db, _ := testutils.Fixture(t, values, config)
			gtfs := types.NewGtfsFromSQLite(db, "")
			transfers.RunValidations(*gtfs, config)
			testutils.AssertFindings(t, tc.id, tc.field, types.SEVERITY_ERROR, 1)
		})
	}
}
