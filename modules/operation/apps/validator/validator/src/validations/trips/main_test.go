package trips_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"main/services"
	"main/types"
	trips "main/validations/trips"
	testutils "main/validations/trips/utils"
	"path/filepath"
	"strconv"
	"testing"
)

func TestEveryCheckHasOneAction(t *testing.T) {
	source, err := parser.ParseFile(token.NewFileSet(), "main.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	actions := map[string]int{}
	ast.Inspect(source, func(node ast.Node) bool {
		literal, ok := node.(*ast.CompositeLit)
		if !ok {
			return true
		}
		selector, ok := literal.Type.(*ast.SelectorExpr)
		if !ok || selector.Sel.Name != "RuleActions" {
			return true
		}
		for _, element := range literal.Elts {
			pair := element.(*ast.KeyValueExpr)
			key := pair.Key.(*ast.BasicLit)
			id, err := strconv.Unquote(key.Value)
			if err != nil {
				t.Fatal(err)
			}
			actions[id]++
		}
		return true
	})
	files, err := filepath.Glob("*/checks/*.go")
	if err != nil {
		t.Fatal(err)
	}
	count := 0
	for _, path := range files {
		source, err := parser.ParseFile(token.NewFileSet(), path, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		ast.Inspect(source, func(node ast.Node) bool {
			spec, ok := node.(*ast.ValueSpec)
			if !ok || len(spec.Names) != 1 || spec.Names[0].Name != "ruleID" {
				return true
			}
			literal := spec.Values[0].(*ast.BasicLit)
			id, err := strconv.Unquote(literal.Value)
			if err != nil {
				t.Fatal(err)
			}
			if actions[id] != 1 {
				t.Errorf("%s has %d action registrations", id, actions[id])
			}
			delete(actions, id)
			count++
			return true
		})
	}
	if count != 36 {
		t.Errorf("check count=%d, want 36", count)
	}
	if len(actions) > 0 {
		t.Errorf("unmatched actions: %v", actions)
	}
}

func TestRouteDependenciesDoNotBlockOtherRoutes(t *testing.T) {
	const rowRule = "trips_direction_id_valid_enum"
	const groupRule = "trips_shape_id_max_two_per_route"
	config := testutils.Config(rowRule, types.SEVERITY_ERROR)
	config.SetRule(groupRule, types.RuleContext{Severity: types.SEVERITY_WARNING, DependsOn: []string{rowRule}})
	db, _ := testutils.Fixture(t, map[string]any{"trip_id": "T1", "route_id": "R1", "direction_id": "bad", "shape_id": "S1"}, config)
	if _, err := db.Exec(`INSERT INTO trips(trip_id,route_id,direction_id,shape_id) VALUES
 ('T2','R1','0','S2'),('T3','R1','1','S3'),
 ('T4','R2','0','S1'),('T5','R2','0','S2'),('T6','R2','1','S3')`); err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	trips.RunValidations(*gtfs, config)
	if got := services.AppMessageService.RuleIssueCount(rowRule); got != 1 {
		t.Fatalf("row findings=%d", got)
	}
	if got := services.AppMessageService.RuleIssueCount(groupRule); got != 1 {
		t.Fatalf("group findings=%d", got)
	}
	for _, message := range services.AppMessageService.GetSummary().AllMessages() {
		if message.RuleID == groupRule && (len(message.Rows) != 1 || message.Rows[0] != 8 || message.Severity != types.SEVERITY_WARNING) {
			t.Fatalf("wrong group: %+v", message)
		}
	}
}

func TestPatternShapeConflictSuppression(t *testing.T) {
	const patternRule = "trips_one_shape_id_per_pattern_id_group"
	const shapeRule = "trips_one_pattern_id_per_shape_id_group"
	for _, tc := range []struct {
		name                     string
		severity                 types.Severity
		blockPattern             bool
		patternCount, shapeCount uint64
	}{
		{"PatternReportsFirst", types.SEVERITY_ERROR, false, 1, 0},
		{"IgnoredPatternDoesNotSuppress", types.SEVERITY_IGNORE, false, 0, 1},
		{"FailedPrerequisiteDoesNotSuppress", types.SEVERITY_ERROR, true, 0, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(patternRule, tc.severity)
			config.SetRule(shapeRule, types.RuleContext{Severity: types.SEVERITY_ERROR})
			if tc.blockPattern {
				config.SetRule("trips_route_id_field", types.RuleContext{Severity: types.SEVERITY_INFO})
				config.SetRule(patternRule, types.RuleContext{Severity: tc.severity, DependsOn: []string{"trips_route_id_field"}})
			}
			db, _ := testutils.Fixture(t, map[string]any{"trip_id": "T1", "pattern_id": "P1", "shape_id": "S1", "route_id": ""}, config)
			if _, err := db.Exec("INSERT INTO trips(trip_id,pattern_id,shape_id,route_id) VALUES ('T2','P1','S2','R1'),('T3','P2','S1','R1')"); err != nil {
				t.Fatal(err)
			}
			gtfs := types.NewGtfsFromSQLite(db, "")
			trips.RunValidations(*gtfs, config)
			if got := services.AppMessageService.RuleIssueCount(patternRule); got != tc.patternCount {
				t.Fatalf("pattern findings=%d, want %d", got, tc.patternCount)
			}
			if got := services.AppMessageService.RuleIssueCount(shapeRule); got != tc.shapeCount {
				t.Fatalf("shape findings=%d, want %d", got, tc.shapeCount)
			}
		})
	}
}

func TestPatternSignaturesUseValidatedStopSequences(t *testing.T) {
	const sequenceRule = "trips_stop_sequence_increasing_by_one_along_trip"
	const signatureRule = "trips_pattern_id_single_trip_signature_per_pattern"
	config := testutils.Config(sequenceRule, types.SEVERITY_ERROR)
	config.SetRule(signatureRule, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{sequenceRule}})
	db, _ := testutils.Fixture(t, map[string]any{"trip_id": "T1", "pattern_id": "P1"}, config)
	if _, err := db.Exec("INSERT INTO trips(trip_id,pattern_id) VALUES ('T2','P1');INSERT INTO stop_times VALUES ('T2','A','1','0'),('T2','C','2','1000')"); err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	trips.RunValidations(*gtfs, config)
	if got := services.AppMessageService.RuleIssueCount(sequenceRule); got != 0 {
		t.Fatalf("sequence findings=%d", got)
	}
	if got := services.AppMessageService.RuleIssueCount(signatureRule); got != 1 {
		t.Fatalf("signature findings=%d", got)
	}
}
