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

func TestShapePointsCoordinatesDistances(t *testing.T) {
	const id = "shapes_shape_dist_traveled_segment_valid"
	segment := lib.HaversineDistance(types.Coordinates{Lat: 0, Lng: 0}, types.Coordinates{Lat: 0, Lng: 0.001})
	for _, tc := range []struct {
		name     string
		start    string
		end      string
		options  []string
		middle   []string
		severity types.Severity
		nilRules bool
		count    int
	}{
		{name: "FirstSegmentMatchesKilometres", start: "0", end: fmt.Sprint(segment / 1000), severity: types.SEVERITY_ERROR},
		{name: "FirstSegmentMismatch", start: "0", end: fmt.Sprint((segment + 30) / 1000), severity: types.SEVERITY_ERROR, count: 1},
		{name: "WithinDefaultTolerance", start: "0", end: fmt.Sprint((segment + 10) / 1000), severity: types.SEVERITY_ERROR},
		{name: "ZeroIncrementBetweenDifferentCoordinates", start: "0", end: "0", severity: types.SEVERITY_ERROR, count: 1},
		{name: "DecreasingDistance", start: "1", end: "0", severity: types.SEVERITY_ERROR},
		{name: "ExplicitMetres", start: "0", end: fmt.Sprint(segment), options: []string{"0", " M "}, severity: types.SEVERITY_ERROR},
		{name: "ExplicitKilometres", start: "900", end: fmt.Sprint(900 + segment/1000), options: []string{"0", "km"}, severity: types.SEVERITY_ERROR},
		{name: "AutomaticMetres", start: "900", end: fmt.Sprint(900 + segment), severity: types.SEVERITY_ERROR},
		{name: "UnknownUnitUsesHeuristic", start: "0", end: fmt.Sprint(segment / 1000), options: []string{"0", "unknown"}, severity: types.SEVERITY_ERROR},
		{name: "ZeroToleranceRoundingAllowance", start: "0", end: fmt.Sprint(segment + 0.0000005), options: []string{"0", "m"}, severity: types.SEVERITY_ERROR},
		{name: "ZeroToleranceMismatch", start: "0", end: fmt.Sprint(segment + 0.01), options: []string{"0", "m"}, severity: types.SEVERITY_ERROR, count: 1},
		{name: "CustomTolerance", start: "0", end: "0", options: []string{"200"}, severity: types.SEVERITY_ERROR},
		{name: "EmptyOptions", start: "0", end: "0", options: []string{}, severity: types.SEVERITY_ERROR, count: 1},
		{name: "InvalidTolerance", start: "0", end: "0", options: []string{"bad"}, severity: types.SEVERITY_ERROR, count: 1},
		{name: "NegativeTolerance", start: "0", end: "0", options: []string{"-1"}, severity: types.SEVERITY_ERROR, count: 1},
		{name: "NonFiniteTolerance", start: "0", end: "0", options: []string{"NaN"}, severity: types.SEVERITY_ERROR, count: 1},
		{name: "Warning", start: "0", end: "0", severity: types.SEVERITY_WARNING, count: 1},
		{name: "Info", start: "0", end: "0", severity: types.SEVERITY_INFO, count: 1},
		{name: "Ignore", start: "0", end: "0", severity: types.SEVERITY_IGNORE},
		{name: "MissingSeverity", start: "0", end: "0"},
		{name: "NilRules", start: "0", end: "0", nilRules: true},
		{name: "MissingDistance", start: "0", end: "", severity: types.SEVERITY_ERROR},
		{name: "MalformedDistance", start: "0", end: "bad", severity: types.SEVERITY_ERROR},
		{name: "NegativeDistance", start: "-1", end: "0", severity: types.SEVERITY_ERROR},
		{name: "NonFiniteDistance", start: "0", end: "NaN", severity: types.SEVERITY_ERROR},
		{name: "InfiniteDistance", start: "0", end: "+Inf", severity: types.SEVERITY_ERROR},
		{name: "MissingCoordinateBreaksChain", start: "0", end: "0", middle: []string{"5", "", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
		{name: "MalformedCoordinateBreaksChain", start: "0", end: "0", middle: []string{"5", "bad", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
		{name: "InvalidCoordinateBreaksChain", start: "0", end: "0", middle: []string{"5", "91", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
		{name: "MissingDistanceBreaksChain", start: "0", end: "0", middle: []string{"5", "0", "0.0005", ""}, severity: types.SEVERITY_ERROR},
		{name: "NegativeDistanceBreaksChain", start: "0", end: "0", middle: []string{"5", "0", "0.0005", "-1"}, severity: types.SEVERITY_ERROR},
		{name: "MissingSequenceSkipsShape", start: "0", end: "0", middle: []string{"", "0", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
		{name: "NegativeSequenceSkipsShape", start: "0", end: "0", middle: []string{"-1", "0", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
		{name: "DuplicateSequenceSkipsShape", start: "0", end: "0", middle: []string{"10", "0", "0.0005", "0"}, severity: types.SEVERITY_ERROR},
	} {
		t.Run(tc.name, func(t *testing.T) {
			connection, table := coordinateDistanceTable(t)
			// Reverse sequence order and sparse rows verify numeric sorting and source rows.
			_, err := connection.Exec(`INSERT INTO shapes (rowid,shape_id,shape_pt_sequence,shape_pt_lat,shape_pt_lon,shape_dist_traveled)
				VALUES (1,'O''Brien','10','0','0.001',?),(7,'O''Brien','0','0','0',?),
				(9,'other','0','0','0','9000'),(10,'other','1','0','1','9000')`, tc.end, tc.start)
			if err != nil {
				t.Fatal(err)
			}
			if tc.middle != nil {
				if _, err := connection.Exec("INSERT INTO shapes VALUES (?,?,?,?,?)", "O'Brien", tc.middle[0], tc.middle[1], tc.middle[2], tc.middle[3]); err != nil {
					t.Fatal(err)
				}
			}
			config := &types.ShapesRules{}
			rule := types.RuleConfig{Severity: tc.severity}
			if tc.options != nil {
				rule.Options = &tc.options
			}
			config.SetRule(id, rule)
			ruleset.ConfigureMessageSeverities(&types.GtfsRules{Shapes: *config})
			if tc.nilRules {
				config = nil
			}
			if err := checks.ShapePointsCoordinatesDistances(table.At(6).Context(), config); err != nil {
				t.Fatal(err)
			}
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(tc.count) {
				t.Fatalf("findings=%d want=%d", got, tc.count)
			}
			for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
				if msg.RuleID != id || msg.Field != "shape_dist_traveled" || msg.FileName != "shapes.txt" || len(msg.Rows) != 1 || msg.Rows[0] != 2 || msg.Severity != tc.severity {
					t.Fatalf("unexpected finding: %+v", msg)
				}
			}
		})
	}
}

func TestShapePointsCoordinatesDistancesManySegments(t *testing.T) {
	const id = "shapes_shape_dist_traveled_segment_valid"
	for _, gaps := range []int{100, 101} {
		t.Run(fmt.Sprint(gaps), func(t *testing.T) {
			connection, table := coordinateDistanceTable(t)
			for i := 0; i <= gaps; i++ {
				if _, err := connection.Exec("INSERT INTO shapes VALUES ('shape',?,'0',?,'0')", fmt.Sprint(i), fmt.Sprint(i%2)); err != nil {
					t.Fatal(err)
				}
			}
			config := &types.ShapesRules{}
			config.SetRule(id, types.RuleConfig{Severity: types.SEVERITY_ERROR})
			ruleset.ConfigureMessageSeverities(&types.GtfsRules{Shapes: *config})
			if err := checks.ShapePointsCoordinatesDistances(table.At(0).Context(), config); err != nil {
				t.Fatal(err)
			}
			if got := services.AppMessageService.RuleIssueCount(id); got != uint64(gaps) {
				t.Fatalf("findings=%d want=%d", got, gaps)
			}
			ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", id, 0, services.AppMessageService)
			rows := map[int]bool{}
			for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
				if msg.Message == ctx.GetTranslatedMessage("ManyErrors") || len(msg.Rows) != 1 {
					t.Fatalf("expected an individual finding for each segment: %+v", msg)
				}
				for _, row := range msg.Rows {
					if row < 3 || row > gaps+2 || rows[row] {
						t.Fatalf("unexpected or duplicate row: %d", row)
					}
					rows[row] = true
				}
			}
			// Every segment retains its own diagnostic, including above 100 findings.
			if len(rows) != gaps || !rows[gaps+2] {
				t.Fatalf("reported rows=%d want=%d; last row present=%v", len(rows), gaps, rows[gaps+2])
			}
			connection.Close()
			if err := checks.ShapePointsCoordinatesDistances(table.At(0).Context(), config); err == nil {
				t.Fatal("SQLite failure was swallowed")
			}
		})
	}
}

func coordinateDistanceTable(t *testing.T) (*sql.DB, *services.SQLiteTable) {
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
	if _, err := connection.Exec(`CREATE TABLE shapes (shape_id TEXT,shape_pt_sequence TEXT,shape_pt_lat TEXT,shape_pt_lon TEXT,shape_dist_traveled TEXT)`); err != nil {
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
