package services_test

import (
	"database/sql"
	"main/lib/rules"
	"main/services"
	"main/types"
	"path/filepath"
	"reflect"
	"testing"
)

func TestRuleRunnerTableOrdersRowAndGroupDependencies(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "shapes.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := db.Exec(`CREATE TABLE shapes (shape_id TEXT); INSERT INTO shapes VALUES ('bad'),('good'),('good'),('bad'),('');`); err != nil {
		t.Fatal(err)
	}
	gtfs := types.NewGtfsFromSQLite(db, "")
	table, err := services.NewSQLiteTable(db, "shapes")
	if err != nil {
		t.Fatal(err)
	}
	const rowRule = "shapes_shape_pt_lat_valid"
	const first = "shapes_shape_point_spacing_valid"
	const second = "shapes_shape_dist_traveled_segment_valid"
	const missing = "shapes_shape_id_field"
	const blocked = "shapes_shape_dist_traveled_block_valid"
	config := &types.GtfsRules{}
	config.SetRule(rowRule, types.RuleContext{Severity: types.SEVERITY_INFO})
	config.SetRule(first, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{rowRule}})
	config.SetRule(second, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{first}})
	config.SetRule(missing, types.RuleContext{Severity: types.SEVERITY_ERROR})
	config.SetRule(blocked, types.RuleContext{Severity: types.SEVERITY_ERROR, DependsOn: []string{missing}})
	rules.ConfigureMessageSeverities(nil)
	services.AppMessageService.Clear()
	t.Cleanup(func() { services.AppMessageService.Clear() })
	runner, err := services.NewRuleRunner(*gtfs, config, "shapes")
	if err != nil {
		t.Fatal(err)
	}
	var rowVisits, tracked int
	var groupOrder []string
	err = runner.RunTable(table, "shape", "shape_id", func(ctx *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			second: func() {
				if ctx.Row != 1 {
					t.Fatalf("unexpected group row: %d", ctx.Row)
				}
				groupOrder = append(groupOrder, second)
			},
			first: func() {
				if rowVisits != 5 || ctx.Row != 1 {
					t.Fatalf("group ran before every prerequisite or for the wrong group: visits=%d row=%d", rowVisits, ctx.Row)
				}
				groupOrder = append(groupOrder, first)
			},
			rowRule: func() {
				rowVisits++
				// Failure on the last member must block the entire bad shape.
				if ctx.Row == 3 {
					services.AppMessageService.AddMessage(types.Message{RuleID: rowRule, Severity: types.SEVERITY_INFO, Rows: []int{ctx.Row}, FileName: "shapes.txt", Message: "bad point"})
				}
			},
			blocked: func() { t.Fatal("missing implementation passed its dependency") },
		}
	}, func() { tracked++ })
	if err != nil {
		t.Fatal(err)
	}
	if tracked != 5 || rowVisits != 5 || !reflect.DeepEqual(groupOrder, []string{first, second}) {
		t.Fatalf("tracked=%d rows=%d grouped=%v", tracked, rowVisits, groupOrder)
	}
	if services.AppMessageService.TotalErrors() != 0 || services.AppMessageService.TotalWarnings() != 0 {
		t.Fatal("info finding changed error or warning totals")
	}
}
