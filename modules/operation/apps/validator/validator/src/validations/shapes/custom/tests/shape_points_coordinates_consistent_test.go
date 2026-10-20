package shapes_custom_test

import (
	"database/sql"
	"fmt"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	checks "main/validations/shapes/custom/checks"
	"path/filepath"
	"testing"
)

func TestShapePointsCoordinatesConsistent(t *testing.T) {
	const id = "shape_sequence_position_mismatches_cumulative_traveled_distance"
	for _, tc := range []struct {
		name      string
		severity  types.Severity
		tolerance *string
		middle    []string
		count     int
		nilRules  bool
	}{
		{name: "GapWithoutRecordedDistance", severity: types.SEVERITY_ERROR, count: 1},
		{name: "Warning", severity: types.SEVERITY_WARNING, count: 1},
		{name: "Info", severity: types.SEVERITY_INFO, count: 1},
		{name: "Ignore", severity: types.SEVERITY_IGNORE},
		{name: "MissingSeverity"},
		{name: "NilRules", nilRules: true},
		{name: "CustomTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("3000")},
		{name: "InvalidTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("bad"), count: 1},
		{name: "ZeroTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("0"), count: 1},
		{name: "NegativeTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("-1"), count: 1},
		{name: "NaNTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("NaN"), count: 1},
		{name: "InfiniteTolerance", severity: types.SEVERITY_ERROR, tolerance: toleranceValue("+Inf"), count: 1},
		{name: "MissingCoordinateBreaksChain", severity: types.SEVERITY_ERROR, middle: []string{"5", "", "0.01"}},
		{name: "MalformedCoordinateBreaksChain", severity: types.SEVERITY_ERROR, middle: []string{"5", "bad", "0.01"}},
		{name: "InvalidCoordinateBreaksChain", severity: types.SEVERITY_ERROR, middle: []string{"5", "91", "0.01"}},
		{name: "NonFiniteCoordinateBreaksChain", severity: types.SEVERITY_ERROR, middle: []string{"5", "NaN", "0.01"}},
		{name: "MissingSequenceSkipsShape", severity: types.SEVERITY_ERROR, middle: []string{"", "0", "0.01"}},
		{name: "MalformedSequenceSkipsShape", severity: types.SEVERITY_ERROR, middle: []string{"bad", "0", "0.01"}},
		{name: "NegativeSequenceSkipsShape", severity: types.SEVERITY_ERROR, middle: []string{"-1", "0", "0.01"}},
		{name: "DuplicateSequenceSkipsShape", severity: types.SEVERITY_ERROR, middle: []string{"10", "0", "0.01"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			connection, table := coordinateGapTable(t)
			// Numeric sequence order differs from source row order; the current point
			// must retain its original CSV row. No shape_dist_traveled column exists.
			for _, query := range []string{
				`INSERT INTO shapes VALUES ('O''Brien','10','0','0.02')`,
				`INSERT INTO shapes (rowid,shape_id,shape_pt_sequence,shape_pt_lat,shape_pt_lon) VALUES (7,'O''Brien','0','0','0')`,
				`INSERT INTO shapes VALUES ('other','0','0','0'),('other','1','0','50')`,
			} {
				if _, err := connection.Exec(query); err != nil {
					t.Fatal(err)
				}
			}
			if tc.middle != nil {
				if _, err := connection.Exec("INSERT INTO shapes VALUES (?,?,?,?)", "O'Brien", tc.middle[0], tc.middle[1], tc.middle[2]); err != nil {
					t.Fatal(err)
				}
			}
			config := &types.ShapesRules{}
			rule := types.RuleConfig{Severity: tc.severity}
			if tc.tolerance != nil {
				options := []string{*tc.tolerance}
				rule.Options = &options
			}
			config.SetRule(id, rule)
			ruleset.ConfigureMessageSeverities(&types.GtfsRules{Shapes: *config})
			if tc.nilRules {
				config = nil
			}
			if err := checks.ShapePointsCoordinatesConsistent(table.At(6).Context(), config); err != nil {
				t.Fatal(err)
			}
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(tc.count) {
				t.Fatalf("findings=%d want=%d", got, tc.count)
			}
			for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
				if msg.RuleID != id || msg.Field != "shape_pt_sequence" || msg.Rows[0] != 2 || msg.Severity != tc.severity {
					t.Fatalf("unexpected finding: %+v", msg)
				}
			}
		})
	}
}

func TestShapePointsCoordinatesConsistentManyGaps(t *testing.T) {
	const id = "shape_sequence_position_mismatches_cumulative_traveled_distance"
	for _, gaps := range []int{100, 101} {
		t.Run(fmt.Sprint(gaps), func(t *testing.T) {
			connection, table := coordinateGapTable(t)
			for i := 0; i <= gaps; i++ {
				if _, err := connection.Exec("INSERT INTO shapes VALUES ('shape',?,'0',?)", fmt.Sprint(i), fmt.Sprint(i%2)); err != nil {
					t.Fatal(err)
				}
			}
			config := &types.ShapesRules{}
			config.SetRule(id, types.RuleConfig{Severity: types.SEVERITY_ERROR})
			ruleset.ConfigureMessageSeverities(&types.GtfsRules{Shapes: *config})
			if err := checks.ShapePointsCoordinatesConsistent(table.At(0).Context(), config); err != nil {
				t.Fatal(err)
			}
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(gaps) {
				t.Fatalf("findings=%d want=%d", got, gaps)
			}
			ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", id, 0, services.AppMessageService)
			rows := map[int]bool{}
			for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
				if msg.Message == ctx.GetTranslatedMessage("ManyErrors") || len(msg.Rows) != 1 {
					t.Fatalf("expected an individual finding for each gap: %+v", msg)
				}
				for _, row := range msg.Rows {
					if row < 3 || row > gaps+2 || rows[row] {
						t.Fatalf("unexpected or duplicate row: %d", row)
					}
					rows[row] = true
				}
			}
			// Each gap has its own diagnostic, including when there are more than 100.
			if len(rows) != gaps || !rows[gaps+2] {
				t.Fatalf("reported rows=%d want=%d; last row present=%v", len(rows), gaps, rows[gaps+2])
			}
			connection.Close()
			if err := checks.ShapePointsCoordinatesConsistent(table.At(0).Context(), config); err == nil {
				t.Fatal("SQLite failure was swallowed")
			}
		})
	}
}

func coordinateGapTable(t *testing.T) (*sql.DB, *services.SQLiteTable) {
	t.Helper()
	connection, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "shapes.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		connection.Close()
		ruleset.ConfigureMessageSeverities(nil)
		services.AppMessageService.Clear()
	})
	services.AppMessageService.Clear()
	if _, err := connection.Exec(`CREATE TABLE shapes (shape_id TEXT,shape_pt_sequence TEXT,shape_pt_lat TEXT,shape_pt_lon TEXT)`); err != nil {
		t.Fatal(err)
	}
	tables, err := services.PrepareSQLiteTables(connection)
	if err != nil {
		t.Fatal(err)
	}
	table, err := tables.Table("shapes")
	if err != nil {
		t.Fatal(err)
	}
	return connection, table
}
