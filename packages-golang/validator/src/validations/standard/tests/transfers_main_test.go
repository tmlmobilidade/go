package standard_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestPresenceDependenciesAreRowLocal(t *testing.T) {
	const presence = "transfers_from_stop_id_field"
	const value = "transfers_min_transfer_time_valid"
	config := validationutils.TransfersConfig(presence, types.SEVERITY_INFO)
	config.SetRule(value, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{presence}})
	db, _ := validationutils.TransfersFixture(t, map[string]any{"from_stop_id": "", "transfer_type": "2", "min_transfer_time": "bad"}, config)
	if _, err := db.Exec("INSERT INTO transfers(from_stop_id,transfer_type,min_transfer_time) VALUES ('A','2','bad')"); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	validations.RunTransfersValidations(*gtfs, config, tables)
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
	const timeRule = "transfers_min_transfer_time_valid"
	const stopRule = "transfers_from_stop_id_foreign"
	config := validationutils.TransfersConfig(timeRule, types.SEVERITY_ERROR)
	config.SetRule(stopRule, types.RuleContext{Severity: types.SEVERITY_ERROR})
	db, _ := validationutils.TransfersFixture(t, map[string]any{"from_stop_id": "unknown", "min_transfer_time": "bad"}, config)
	gtfs := types.NewGtfsFromSQLite(db, "")
	validations.RunTransfersValidations(*gtfs, config)
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
		{"transfers_from_stop_id_foreign", "from_stop_id", "missing"},
		{"transfers_from_route_id_foreign", "from_route_id", "missing"},
		{"transfers_from_trip_id_foreign", "from_trip_id", "missing"},
		{"transfers_to_stop_id_foreign", "to_stop_id", "missing"},
		{"transfers_to_route_id_foreign", "to_route_id", "missing"},
		{"transfers_to_trip_id_foreign", "to_trip_id", "missing"},
		{"transfers_transfer_type_valid", "transfer_type", "missing"},
		{"transfers_min_transfer_time_valid", "min_transfer_time", "missing"},
	} {
		t.Run(tc.id, func(t *testing.T) {
			config := validationutils.TransfersConfig(tc.id, types.SEVERITY_ERROR)
			values := map[string]any{"transfer_type": "2"}
			values[tc.field] = tc.value
			db, _ := validationutils.TransfersFixture(t, values, config)
			gtfs := types.NewGtfsFromSQLite(db, "")
			validations.RunTransfersValidations(*gtfs, config)
			validationutils.TransfersAssertFindings(t, tc.id, tc.field, types.SEVERITY_ERROR, 1)
		})
	}
}
