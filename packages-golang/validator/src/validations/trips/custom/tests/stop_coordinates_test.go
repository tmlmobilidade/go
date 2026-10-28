package trips_custom_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/custom/checks"
	trips_utils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"main/types"
	"testing"
)

func TestStopCoordinates(t *testing.T) {
	runCases(t, "trips_stop_coordinates", "stop_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.StopCoordinates(db, rules, &trips_utils.Geometry{})
	}, []scenario{
		{name: "DuplicateStopUsesFirstCompleteRow", sql: "INSERT INTO stops VALUES ('A','40','-9.1')"},
		{name: "DuplicateStopSkipsIncompleteRow", sql: "UPDATE stops SET stop_lat='' WHERE stop_id='A'; INSERT INTO stops VALUES ('A','40','-9.1')", count: 1},
		{name: "DuplicateStopKeepsInvalidFirstRow", sql: "UPDATE stops SET stop_lat='invalid' WHERE stop_id='A'; INSERT INTO stops VALUES ('A','40','-9.1')"},
		{name: "NullCoordinates", sql: "UPDATE stops SET stop_lat=NULL"},
		{name: "OnShape"}, {name: "OffShape", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A'", count: 1}, {name: "RepeatedOffShapeStop", sql: "UPDATE stops SET stop_lat='40' WHERE stop_id='A';INSERT INTO stop_times VALUES ('T1','A','3','2000')", count: 1}, {name: "MissingShape", values: map[string]any{"shape_id": ""}}, {name: "InvalidCoordinates", sql: "UPDATE stops SET stop_lat='invalid'"}, {name: "MissingStop", sql: "DELETE FROM stops"},
	})
}

func TestStopCoordinatesMissingCoordinateColumn(t *testing.T) {
	const id = "trips_stop_coordinates"
	config := trips_utils.Config(id, types.SEVERITY_ERROR)
	db, ctx := trips_utils.Fixture(t, map[string]any{"trip_id": "T1", "shape_id": "R1_0"}, config)
	if _, err := db.Exec("ALTER TABLE stops DROP COLUMN stop_lat"); err != nil {
		t.Fatal(err)
	}
	// Prepare metadata after changing the schema, as with an imported feed.
	tables, err := services.PrepareSQLiteTables(db)
	if err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("trips")
	if err != nil {
		t.Fatal(err)
	}
	if err := checks.StopCoordinates(table.At(ctx.Row).Context(), config.Rule(id), &trips_utils.Geometry{}); err != nil {
		t.Fatal(err)
	}
	trips_utils.AssertFindings(t, id, "stop_id", types.SEVERITY_ERROR, 0)
}

func TestStopCoordinatesCachedViolationReportsEachTrip(t *testing.T) {
	const id = "trips_stop_coordinates"
	config := trips_utils.Config(id, types.SEVERITY_ERROR)
	db, ctx := trips_utils.Fixture(t, map[string]any{"trip_id": "T1", "shape_id": "R1_0"}, config)
	if _, err := db.Exec(`UPDATE stops SET stop_lat='40' WHERE stop_id='A';
		INSERT INTO trips (trip_id, shape_id) VALUES ('T2', 'R1_0');
		INSERT INTO stop_times SELECT 'T2', stop_id, stop_sequence, shape_dist_traveled FROM stop_times WHERE trip_id='T1'`); err != nil {
		t.Fatal(err)
	}
	table, err := ctx.Table("trips")
	if err != nil {
		t.Fatal(err)
	}
	geometry := &trips_utils.Geometry{}
	for _, row := range []int{3, 4} {
		if err := checks.StopCoordinates(table.At(row).Context(), config.Rule(id), geometry); err != nil {
			t.Fatal(err)
		}
	}
	if count := services.AppMessageService.RuleIssueCount(id); count != 2 {
		t.Fatalf("got %d findings, want one per trip", count)
	}
	rows := map[int]bool{}
	for _, message := range services.AppMessageService.GetSummary().AllMessages() {
		if message.RuleID != id {
			t.Fatalf("unexpected finding: %+v", message)
		}
		for _, row := range message.Rows {
			rows[row] = true
		}
	}
	if len(rows) != 2 || !rows[5] || !rows[6] {
		t.Fatalf("findings attached to wrong source rows: %v", rows)
	}
}
