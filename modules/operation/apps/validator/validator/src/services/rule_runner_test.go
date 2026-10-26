package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"main/lib/rules"
	"main/types"
	"os"
	"path/filepath"
	"testing"
)

func TestFileMissingPrerequisite(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_IGNORE, ""} {
		for _, present := range []bool{false, true} {
			t.Run(fmt.Sprintf("severity=%s/present=%t", severity, present), func(t *testing.T) {
				config := types.GtfsRules{
					"agency_email_field": {Severity: types.SEVERITY_WARNING, DependsOn: []string{"agency_file_missing"}},
					"agency_email_valid": {Severity: types.SEVERITY_WARNING, DependsOn: []string{"agency_email_field"}},
				}
				if severity != "" {
					config["agency_file_missing"] = types.RuleContext{Severity: severity}
				}
				data, err := json.Marshal(config)
				if err != nil {
					t.Fatal(err)
				}
				path := filepath.Join(t.TempDir(), "rules.json")
				if err := os.WriteFile(path, data, 0600); err != nil {
					t.Fatal(err)
				}
				parsed, err := ParseRulesFromFile(path)
				if err != nil {
					t.Fatal(err)
				}
				db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.db"))
				if err != nil {
					t.Fatal(err)
				}
				t.Cleanup(func() { db.Close() })
				if present {
					if _, err := db.Exec(`CREATE TABLE agency (agency_id TEXT); INSERT INTO agency VALUES ('1'), ('2')`); err != nil {
						t.Fatal(err)
					}
				}
				runner, err := NewRuleRunner(*types.NewGtfsFromSQLite(db, ""), parsed, "agency")
				if err != nil {
					t.Fatal(err)
				}
				calls := 0
				actions := RuleActions{
					"agency_email_field": func() { calls++ },
					"agency_email_valid": func() { calls++ },
				}
				statuses := runner.Run(actions, nil)
				wantFile, wantRule, wantCalls := rules.Failed, rules.Skipped, 0
				if present {
					wantFile, wantRule, wantCalls = rules.Passed, rules.Passed, 2
				}
				if statuses["agency_file_missing"] != wantFile || statuses["agency_email_field"] != wantRule || statuses["agency_email_valid"] != wantRule || calls != wantCalls {
					t.Fatalf("unexpected dependency outcomes: %v, calls=%d", statuses, calls)
				}
				if present {
					table, err := NewSQLiteTable(db, "agency")
					if err != nil {
						t.Fatal(err)
					}
					calls = 0
					if err := runner.RunTable(table, "agency", "agency_id", func(*SQLiteContext) RuleActions { return actions }, nil); err != nil {
						t.Fatal(err)
					}
					if calls != 4 {
						t.Fatalf("expected both checks on both rows, got %d calls", calls)
					}
				}
			})
		}
	}
}

// A trip is complete only after its row prerequisites and grouped rules have
// finished. Interleaved source rows must still belong to the correct trip.
func TestRunTableCompletedProgressAndGroupIsolation(t *testing.T) {
	for _, severity := range []types.Severity{types.SEVERITY_INFO, types.SEVERITY_WARNING, types.SEVERITY_ERROR} {
		t.Run(string(severity), func(t *testing.T) {
			db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "progress.db"))
			if err != nil {
				t.Fatal(err)
			}
			t.Cleanup(func() { db.Close(); AppMessageService.Clear(); rules.ConfigureMessageSeverities(nil) })
			_, err = db.Exec(`CREATE TABLE stop_times (trip_id TEXT);
				INSERT INTO stop_times (rowid, trip_id) VALUES
				(2, 'bad'), (4, 'good'), (7, 'bad'), (9, 'good'), (11, ''), (14, NULL)`)
			if err != nil {
				t.Fatal(err)
			}
			config := types.GtfsRules{
				"stop_times_trip_id_field":                   {Severity: severity, DependsOn: []string{"stop_times_file_missing"}},
				"stop_times_trip_id_foreign":                 {Severity: types.SEVERITY_ERROR, DependsOn: []string{"stop_times_trip_id_field"}},
				"stop_times_arrival_departure_time_sequence": {Severity: types.SEVERITY_ERROR, DependsOn: []string{"stop_times_trip_id_foreign"}},
				"stop_times_pickup_type_field":               {Severity: types.SEVERITY_IGNORE},
				"stop_times_pickup_type_valid":               {Severity: types.SEVERITY_ERROR, DependsOn: []string{"stop_times_pickup_type_field"}},
				"stop_times_drop_off_type_field":             {Severity: types.SEVERITY_ERROR}, // Deliberately unimplemented.
				"stop_times_drop_off_type_valid":             {Severity: types.SEVERITY_ERROR, DependsOn: []string{"stop_times_drop_off_type_field"}},
			}
			rules.ConfigureMessageSeverities(&config)
			AppMessageService.Clear()
			runner, err := NewRuleRunner(*types.NewGtfsFromSQLite(db, ""), &config, "stop_times")
			if err != nil {
				t.Fatal(err)
			}
			table, err := NewSQLiteTable(db, "stop_times")
			if err != nil {
				t.Fatal(err)
			}
			var checked, foreign, grouped []int
			registrations, completed := 0, 0
			err = runner.RunTable(table, "trip", "trip_id", func(ctx *SQLiteContext) RuleActions {
				registrations++
				return RuleActions{
					"stop_times_trip_id_field": func() {
						checked = append(checked, ctx.Row)
						if ctx.Row == 6 {
							AppMessageService.AddMessage(types.Message{RuleID: "stop_times_trip_id_field", FileName: "stop_times.txt", Field: "trip_id", Severity: severity, Rows: []int{ctx.Row}, Message: "invalid trip"})
						}
					},
					"stop_times_trip_id_foreign":                 func() { foreign = append(foreign, ctx.Row) },
					"stop_times_arrival_departure_time_sequence": func() { grouped = append(grouped, ctx.Row) },
					"stop_times_pickup_type_field":               func() { t.Fatal("ignored rule ran") },
					"stop_times_pickup_type_valid":               func() { t.Fatal("ignored prerequisite passed") },
					"stop_times_drop_off_type_valid":             func() { t.Fatal("unimplemented prerequisite passed") },
				}
			}, func() {
				completed++
				if len(checked) < completed {
					t.Fatal("progress reported before row validation")
				}
				if completed >= 3 && len(grouped) != 1 {
					t.Fatal("progress reported before grouped validation")
				}
			})
			if err != nil {
				t.Fatal(err)
			}
			if registrations != 6 || completed != 6 {
				t.Fatalf("registrations=%d completed=%d", registrations, completed)
			}
			if fmt.Sprint(checked) != "[1 6 3 8 10 13]" || fmt.Sprint(foreign) != "[1 3 8 10 13]" || fmt.Sprint(grouped) != "[3]" {
				t.Fatalf("checked=%v foreign=%v grouped=%v", checked, foreign, grouped)
			}
		})
	}
}

func TestRunTableReadFailureDoesNotReportCompletion(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "closed.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := db.Exec("CREATE TABLE stop_times (trip_id TEXT)"); err != nil {
		t.Fatal(err)
	}
	runner, err := NewRuleRunner(*types.NewGtfsFromSQLite(db, ""), &types.GtfsRules{}, "stop_times")
	if err != nil {
		t.Fatal(err)
	}
	table, err := NewSQLiteTable(db, "stop_times")
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	err = runner.RunTable(table, "trip", "trip_id", func(*SQLiteContext) RuleActions {
		t.Fatal("actions registered after read failure")
		return nil
	}, func() { t.Fatal("reported completion after read failure") })
	if err == nil {
		t.Fatal("expected SQLite read failure")
	}
}

func TestRunTableGroupedFailureBlocksOnlyItsGroup(t *testing.T) {
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "shapes.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close(); AppMessageService.Clear(); rules.ConfigureMessageSeverities(nil) })
	if _, err := db.Exec(`CREATE TABLE shapes (shape_id TEXT);
		INSERT INTO shapes VALUES ('bad'), ('good'), ('bad'), ('good')`); err != nil {
		t.Fatal(err)
	}
	config := types.GtfsRules{
		"shape_id_and_point_sequence_required":  {Severity: types.SEVERITY_WARNING, DependsOn: []string{"shapes_file_missing"}},
		"shape_pt_sequence_strictly_increasing": {Severity: types.SEVERITY_ERROR, DependsOn: []string{"shape_id_and_point_sequence_required"}},
	}
	rules.ConfigureMessageSeverities(&config)
	AppMessageService.Clear()
	runner, err := NewRuleRunner(*types.NewGtfsFromSQLite(db, ""), &config, "shapes")
	if err != nil {
		t.Fatal(err)
	}
	table, err := NewSQLiteTable(db, "shapes")
	if err != nil {
		t.Fatal(err)
	}
	var prerequisites, dependents []int
	completed := 0
	err = runner.RunTable(table, "shape", "shape_id", func(ctx *SQLiteContext) RuleActions {
		return RuleActions{
			"shape_id_and_point_sequence_required": func() {
				prerequisites = append(prerequisites, ctx.Row)
				if ctx.Row == 0 {
					AppMessageService.AddMessage(types.Message{RuleID: "shape_id_and_point_sequence_required", FileName: "shapes.txt", Field: "shape_id", Severity: types.SEVERITY_WARNING, Rows: []int{ctx.Row}, Message: "invalid shape"})
				}
			},
			"shape_pt_sequence_strictly_increasing": func() { dependents = append(dependents, ctx.Row) },
		}
	}, func() {
		completed++
		if completed <= 2 && len(prerequisites) != 1 {
			t.Fatal("reported progress before failed group finished")
		}
		if completed > 2 && len(dependents) != 1 {
			t.Fatal("reported progress before dependent group check")
		}
	})
	if err != nil {
		t.Fatal(err)
	}
	if completed != 4 || fmt.Sprint(prerequisites) != "[0 1]" || fmt.Sprint(dependents) != "[1]" {
		t.Fatalf("completed=%d prerequisites=%v dependents=%v", completed, prerequisites, dependents)
	}
}
