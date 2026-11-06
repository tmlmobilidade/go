package custom_test

import (
	"database/sql"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
	_ "modernc.org/sqlite"
)

type customCheck struct {
	id, table, field string
	run              validationTypes.Check
	skipForbidden    bool
	required         []string
}
type customCase struct {
	name     string
	tables   map[string][]map[string]any
	wantRows []int
	options  []string
	compare  [][2]string
}

func checkCustom(t *testing.T, check customCheck, cases []customCase) {
	t.Helper()
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			db := customFixture(t, tc.tables)
			for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN, ""} {
				name := string(severity)
				if name == "" {
					name = "unconfigured"
				}
				t.Run(name, func(t *testing.T) {
					config := rules.RuleContext{Severity: severity}
					if tc.options != nil {
						config.Options = &tc.options
					}
					if tc.compare != nil {
						compares := []rules.Compare{}
						for _, pair := range tc.compare {
							compares = append(compares, rules.Compare{Key: pair[0], Value: pair[1]})
						}
						config.Compare = &compares
					}
					rows := tc.wantRows
					if severity == "" || severity == rules.SEVERITY_IGNORE || severity == rules.SEVERITY_FORBIDDEN && check.skipForbidden {
						rows = nil
					}
					for range 2 {
						assertCustom(t, check, db, config, rows)
					}
				})
			}
		})
	}
	t.Run("missing_table", func(t *testing.T) {
		for _, table := range append([]string{check.table}, check.required...) {
			t.Run(table, func(t *testing.T) {
				db := customFixture(t, nil)
				if _, err := db.Exec(`DROP TABLE "` + table + `"`); err != nil {
					t.Fatal(err)
				}
				receiver := &testutil.Collector{}
				ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, receiver)
				if err := check.run(ctx); err != nil || !ctx.Skipped || ctx.Failed || len(receiver.Messages) != 0 {
					t.Fatalf("missing table must skip without findings: ctx=%+v err=%v", ctx, err)
				}
			})
		}
	})
	t.Run("empty_table", func(t *testing.T) {
		assertCustom(t, check, customFixture(t, nil), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, nil)
	})
	t.Run("query_error", func(t *testing.T) {
		db := customFixture(t, nil)
		if err := db.Close(); err != nil {
			t.Fatal(err)
		}
		receiver := &testutil.Collector{}
		ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, receiver)
		if err := check.run(ctx); err == nil || len(receiver.Messages) != 0 {
			t.Fatalf("closed database must return an error without findings: %v", err)
		}
	})
	t.Run("nil_context", func(t *testing.T) {
		if err := check.run(nil); err == nil {
			t.Fatal("expected invalid context error")
		}
	})
}

func assertCustom(t *testing.T, check customCheck, db *sql.DB, config rules.RuleContext, rows []int) {
	t.Helper()
	receiver := &testutil.Collector{}
	ctx := context.NewRuleContext(check.id, db, config, receiver)
	if err := check.run(ctx); err != nil {
		t.Fatal(err)
	}
	if ctx.Failed != (len(rows) > 0) || ctx.Skipped || ctx.Source != nil || ctx.Row != -1 {
		t.Fatalf("unexpected outcome or leaked row state: %+v", ctx)
	}
	if len(receiver.Messages) != len(rows) {
		t.Fatalf("got %d findings, want %d: %+v", len(receiver.Messages), len(rows), receiver.Messages)
	}
	severity := config.Severity
	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	for index, message := range receiver.Messages {
		if message.RuleID != check.id || message.FileName != check.table+".txt" || message.Field != check.field || message.Severity != severity || !message.SeverityResolved || !reflect.DeepEqual(message.Rows, []int{rows[index]}) || message.Message == "" {
			t.Errorf("unexpected finding: %+v", message)
		}
	}
}

func customFixture(t *testing.T, rows map[string][]map[string]any) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	columns := map[string][]string{
		"agency":     {"agency_id", "agency_name"},
		"routes":     {"route_id", "route_short_name", "route_sort_order", "line_id", "line_short_name", "path_type"},
		"trips":      {"trip_id", "pattern_id", "route_id", "direction_id", "shape_id", "trip_headsign"},
		"shapes":     {"shape_id", "shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled"},
		"stop_times": {"trip_id", "stop_id", "stop_sequence", "shape_dist_traveled"},
		"stops":      {"stop_id", "stop_lat", "stop_lon"},
		"vehicles":   {"vehicle_code", "vehicle_type"},
	}
	for table, fields := range columns {
		definitions := make([]string, len(fields))
		placeholders := make([]string, len(fields))
		for index, field := range fields {
			definitions[index] = `"` + field + `" TEXT`
			placeholders[index] = "?"
		}
		if _, err := db.Exec(`CREATE TABLE "` + table + `" (` + strings.Join(definitions, ",") + `)`); err != nil {
			t.Fatal(err)
		}
		query := `INSERT INTO "` + table + `" (rowid,"` + strings.Join(fields, `","`) + `") VALUES (?,` + strings.Join(placeholders, ",") + ")"
		for index, row := range rows[table] {
			values := []any{index*3 + 2}
			for _, field := range fields {
				values = append(values, row[field])
			}
			if _, err := db.Exec(query, values...); err != nil {
				t.Fatal(err)
			}
		}
	}
	return db
}
