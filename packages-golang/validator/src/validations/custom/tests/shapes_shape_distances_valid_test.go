package custom_test

import (
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	"main/types"
	"path/filepath"
	"testing"
)

func TestShapeDistancesValid(t *testing.T) {
	const id = "shapes_shape_dist_traveled_block_valid"
	segment := lib.HaversineDistance(types.Coordinates{Lat: 0, Lng: 0}, types.Coordinates{Lat: 0, Lng: 0.001})
	for _, tc := range []struct {
		name       string
		drift      float64
		tolerance  *string
		missingEnd bool
		severity   types.Severity
		count      int
	}{
		{name: "CorrectDistanceIncludesFirstSegment", severity: types.SEVERITY_ERROR},
		{name: "WithinDefaultTolerance", drift: 50, severity: types.SEVERITY_ERROR},
		// Three 100 m segment differences each pass the 200 m default,
		// but their accumulated 300 m difference must fail the block check.
		{name: "AccumulatedDrift", drift: 100, severity: types.SEVERITY_ERROR, count: 1},
		{name: "BadSegmentSkipsBlock", drift: 300, severity: types.SEVERITY_ERROR},
		{name: "MissingFinalDistance", drift: 100, missingEnd: true, severity: types.SEVERITY_ERROR},
		{name: "Warning", drift: 100, severity: types.SEVERITY_WARNING, count: 1},
		{name: "Info", drift: 100, severity: types.SEVERITY_INFO, count: 1},
		{name: "Ignore", drift: 100, severity: types.SEVERITY_IGNORE},
		{name: "MissingSeverity", drift: 100},
		{name: "CustomTolerance", drift: 100, tolerance: toleranceValue("500"), severity: types.SEVERITY_ERROR},
		{name: "LowerCustomTolerance", drift: 10, tolerance: toleranceValue("20"), severity: types.SEVERITY_ERROR, count: 1},
		{name: "InvalidToleranceDefaults", drift: 100, tolerance: toleranceValue("bad"), severity: types.SEVERITY_ERROR, count: 1},
		{name: "NegativeToleranceDefaults", drift: 100, tolerance: toleranceValue("-1"), severity: types.SEVERITY_ERROR, count: 1},
		{name: "InfiniteToleranceDefaults", drift: 100, tolerance: toleranceValue("+Inf"), severity: types.SEVERITY_ERROR, count: 1},
		{name: "NonFiniteToleranceDefaults", drift: 100, tolerance: toleranceValue("NaN"), severity: types.SEVERITY_ERROR, count: 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			connection, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "shapes.db"))
			if err != nil {
				t.Fatal(err)
			}
			defer connection.Close()
			_, err = connection.Exec(`CREATE TABLE shapes (shape_id TEXT,shape_pt_sequence TEXT,shape_pt_lat TEXT,shape_pt_lon TEXT,shape_dist_traveled TEXT)`)
			if err != nil {
				t.Fatal(err)
			}
			// Reverse insertion order checks numeric sequence sorting; sparse row IDs
			// verify that diagnostics retain the original source row.
			for i := 3; i >= 0; i-- {
				var distance any = fmt.Sprint(float64(i) * (segment + tc.drift) / 1000)
				if i == 3 && tc.missingEnd {
					distance = nil
				}
				_, err = connection.Exec("INSERT INTO shapes (rowid,shape_id,shape_pt_sequence,shape_pt_lat,shape_pt_lon,shape_dist_traveled) VALUES (?,?,?,?,?,?)", i+4, "O'Brien", fmt.Sprint(i), "0", fmt.Sprint(float64(i)*0.001), distance)
				if err != nil {
					t.Fatal(err)
				}
			}
			// Another shape must not affect the selected shape's unit heuristic.
			if _, err = connection.Exec("INSERT INTO shapes VALUES ('other','0','0','0','9000')"); err != nil {
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
			config := &types.GtfsRules{}
			rule := types.RuleContext{Severity: tc.severity}
			if tc.tolerance != nil {
				options := []string{*tc.tolerance}
				rule.Options = &options
			}
			config.SetRule(id, rule)
			runtime := config
			ruleset.ConfigureMessageSeverities(runtime)
			services.AppMessageService.Clear()
			t.Cleanup(func() { ruleset.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
			if err := custom.ShapeDistancesValid(table.At(3).Context(), config.Rule("shapes_shape_dist_traveled_block_valid")); err != nil {
				t.Fatal(err)
			}
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(tc.count) {
				t.Fatalf("findings=%d want=%d", got, tc.count)
			}
			for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
				if msg.RuleID != id || msg.Field != "shape_dist_traveled" || msg.Rows[0] != 8 || msg.Severity != tc.severity {
					t.Fatalf("unexpected finding: %+v", msg)
				}
			}
			connection.Close()
			if err := custom.ShapeDistancesValid(table.At(3).Context(), config.Rule("shapes_shape_dist_traveled_block_valid")); err == nil {
				t.Fatal("SQLite failure was swallowed")
			}
		})
	}
}

func toleranceValue(value string) *string { return &value }

func TestShapeDistancesValidMultipleResetBlocks(t *testing.T) {
	const id = "shapes_shape_dist_traveled_block_valid"
	connection, table := coordinateDistanceTable(t)
	segment := lib.HaversineDistance(types.Coordinates{Lat: 0, Lng: 0}, types.Coordinates{Lat: 0, Lng: 0.001})
	for i := 7; i >= 0; i-- {
		distance := float64(i%4) * (segment + 100) / 1000
		if _, err := connection.Exec("INSERT INTO shapes (rowid,shape_id,shape_pt_sequence,shape_pt_lat,shape_pt_lon,shape_dist_traveled) VALUES (?,'shape',?,'0',?,?)", i+4, fmt.Sprint(i), fmt.Sprint(float64(i)*0.001), fmt.Sprint(distance)); err != nil {
			t.Fatal(err)
		}
	}
	config := &types.GtfsRules{}
	config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR})
	ruleset.ConfigureMessageSeverities(config)
	if err := custom.ShapeDistancesValid(table.At(3).Context(), config.Rule("shapes_shape_dist_traveled_block_valid")); err != nil {
		t.Fatal(err)
	}
	if got := services.AppMessageService.RuleIssueCount(id); got != 2 {
		t.Fatalf("findings=%d want=2", got)
	}
	rows := map[int]bool{}
	for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
		if msg.RuleID != id || msg.Field != "shape_dist_traveled" {
			t.Fatalf("unexpected finding: %+v", msg)
		}
		for _, row := range msg.Rows {
			rows[row] = true
		}
	}
	if len(rows) != 2 || !rows[8] || !rows[12] {
		t.Fatalf("expected both block ends on rows 8 and 12, got %v", rows)
	}
}
