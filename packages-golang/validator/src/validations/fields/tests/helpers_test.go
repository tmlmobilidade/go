package fields_test

import (
	"database/sql"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator/src/utils/validations"
	_ "modernc.org/sqlite"
)

type fieldCheck struct {
	id              string
	table           string
	field           string
	run             validationTypes.Check
	skipForbidden   bool
	requiredMessage bool
	severityWording bool
}

type conditionalCase struct {
	name   string
	values []any
	key    string
}

// A blank severity exercises the default configuration, which ignores the rule.
func severities() []rules.Severities {
	return []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN, ""}
}

func severityName(severity rules.Severities) string {
	if severity == "" {
		return "unconfigured"
	}
	return string(severity)
}

func shouldReport(check fieldCheck, severity rules.Severities) bool {
	return severity != "" && severity != rules.SEVERITY_IGNORE && !(severity == rules.SEVERITY_FORBIDDEN && check.skipForbidden)
}

func severityKey(severity rules.Severities, requiredMessage bool) string {
	if severity == rules.SEVERITY_ERROR {
		return "required"
	}
	if severity == rules.SEVERITY_WARNING || requiredMessage {
		return "recommended"
	}
	return "informational"
}

func checkPresence(t *testing.T, check fieldCheck) {
	t.Helper()

	// 1. Keep present and whitespace values, and report empty/NULL rows at their source indexes.
	t.Run("values", func(t *testing.T) {
		db := fixture(t, check.table, []string{check.field}, []int{2, 4, 7, 9}, [][]any{{"present"}, {""}, {nil}, {" "}})
		for _, severity := range severities() {
			t.Run(severityName(severity), func(t *testing.T) {
				var rows []int
				if shouldReport(check, severity) {
					rows = []int{3, 6}
				}
				assertCheck(t, check, db, severity, rows, severityKey(severity, check.requiredMessage))
			})
		}
	})

	// 2. Missing imported columns have the same semantics as empty GTFS cells.
	t.Run("missing_column", func(t *testing.T) {
		db := fixture(t, check.table, []string{"unrelated"}, []int{3}, [][]any{{"value"}})
		assertCheck(t, check, db, rules.SEVERITY_ERROR, []int{2}, "required")
	})

	// 3. The caller supplies the rule ID; the callback must not keep a legacy constant.
	t.Run("supplied_rule_id", func(t *testing.T) {
		check.id = "configured_" + check.id
		db := fixture(t, check.table, []string{check.field}, []int{3}, [][]any{{""}})
		assertCheck(t, check, db, rules.SEVERITY_INFO, []int{2}, severityKey(rules.SEVERITY_INFO, check.requiredMessage))
	})

	checkInputContract(t, check, []string{check.field})
}

func checkConditional(t *testing.T, check fieldCheck, columns []string, cases []conditionalCase, missingKey string) {
	t.Helper()

	// 1. Each validation's test declares its input and expected finding explicitly.
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			db := fixture(t, check.table, columns, []int{5}, [][]any{tc.values})
			for _, severity := range severities() {
				t.Run(severityName(severity), func(t *testing.T) {
					var rows []int
					if tc.key != "" && shouldReport(check, severity) {
						rows = []int{4}
					}
					key := tc.key
					if key == "required" && check.severityWording {
						key = severityKey(severity, false)
					}
					assertCheck(t, check, db, severity, rows, key)
				})
			}
		})
	}

	// 2. Missing conditional columns must use the callback's declared fallback.
	t.Run("missing_columns", func(t *testing.T) {
		db := fixture(t, check.table, []string{"unrelated"}, []int{3}, [][]any{{"value"}})
		var rows []int
		if missingKey != "" {
			rows = []int{2}
		}
		assertCheck(t, check, db, rules.SEVERITY_ERROR, rows, missingKey)
	})

	// 3. Exercise identity injection with a case that emits a finding.
	t.Run("supplied_rule_id", func(t *testing.T) {
		check.id = "configured_" + check.id
		for _, tc := range cases {
			if tc.key == "" {
				continue
			}
			db := fixture(t, check.table, columns, []int{5}, [][]any{tc.values})
			assertCheck(t, check, db, rules.SEVERITY_ERROR, []int{4}, tc.key)
			return
		}
		t.Fatal("conditional test requires at least one finding case")
	})

	checkInputContract(t, check, columns)
}

func checkInputContract(t *testing.T, check fieldCheck, columns []string) {
	t.Helper()
	t.Run("empty_table", func(t *testing.T) {
		assertCheck(t, check, fixture(t, check.table, columns, nil, nil), rules.SEVERITY_ERROR, nil, "")
	})
	t.Run("missing_table", func(t *testing.T) {
		collector := &testutil.Collector{}
		ctx := context.NewRuleContext(check.id, emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)
		if err := check.run(ctx); err != nil || !ctx.Skipped || ctx.Failed || len(collector.Messages) != 0 {
			t.Fatalf("missing table must skip without findings: ctx=%+v err=%v", ctx, err)
		}
	})
	t.Run("query_error", func(t *testing.T) {
		db := emptyDatabase(t)
		if err := db.Close(); err != nil {
			t.Fatal(err)
		}
		collector := &testutil.Collector{}
		ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)
		if err := check.run(ctx); err == nil || len(collector.Messages) != 0 {
			t.Fatalf("database failures must return an error without a missing-value finding: %v", err)
		}
	})
	t.Run("invalid_context", func(t *testing.T) {
		collector := &testutil.Collector{}
		for name, ctx := range map[string]*contextTypes.ValidationContext{
			"nil":              nil,
			"missing_database": context.NewRuleContext(check.id, nil, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector),
			"missing_receiver": context.NewRuleContext(check.id, emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, nil),
		} {
			t.Run(name, func(t *testing.T) {
				if err := check.run(ctx); err == nil {
					t.Fatal("expected an invalid-context error")
				}
			})
		}
		if len(collector.Messages) != 0 {
			t.Fatal("invalid contexts must not emit findings")
		}
	})
}

func assertCheck(t *testing.T, check fieldCheck, db *sql.DB, severity rules.Severities, rows []int, key string) {
	t.Helper()
	collector := &testutil.Collector{}
	ctx := context.NewRuleContext(check.id, db, rules.RuleContext{Severity: severity}, collector)
	if err := check.run(ctx); err != nil {
		t.Fatal(err)
	}
	if ctx.Failed != (len(rows) > 0) || ctx.Source != nil || ctx.Row != -1 || ctx.Skipped {
		t.Fatalf("unexpected outcome or leaked row context: %+v", ctx)
	}
	if ctx.FileName != check.table+".txt" || ctx.Field != check.field {
		t.Fatalf("incorrect source table/field: %+v", ctx)
	}
	if len(collector.Messages) != len(rows) {
		t.Fatalf("got %d findings, want %d: %+v", len(collector.Messages), len(rows), collector.Messages)
	}
	if severity == rules.SEVERITY_FORBIDDEN {
		severity = rules.SEVERITY_ERROR
	}
	for index, message := range collector.Messages {
		if message.RuleID != check.id || message.Field != check.field || message.FileName != check.table+".txt" || message.Severity != severity || !reflect.DeepEqual(message.Rows, []int{rows[index]}) || !message.SeverityResolved || message.Message != i18n.AppTranslator.Get(check.id+"."+key) {
			t.Errorf("unexpected finding: %+v", message)
		}
	}
}

func emptyDatabase(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "gtfs.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	db.SetMaxOpenConns(1)
	return db
}

// Fixture columns reproduce import-gtfs TEXT/NULL storage. One connection also
// catches callbacks that retain a read cursor while performing nested lookups.
func fixture(t *testing.T, table string, columns []string, rowIDs []int, rows [][]any) *sql.DB {
	t.Helper()
	db := emptyDatabase(t)
	definitions := make([]string, len(columns))
	placeholders := make([]string, len(columns))
	for index, column := range columns {
		definitions[index] = `"` + column + `" TEXT`
		placeholders[index] = "?"
	}
	if _, err := db.Exec(`CREATE TABLE "` + table + `" (` + strings.Join(definitions, ",") + `)`); err != nil {
		t.Fatal(err)
	}
	query := `INSERT INTO "` + table + `" (rowid, "` + strings.Join(columns, `","`) + `") VALUES (?,` + strings.Join(placeholders, ",") + `)`
	for index, row := range rows {
		values := append([]any{rowIDs[index]}, row...)
		if _, err := db.Exec(query, values...); err != nil {
			t.Fatal(err)
		}
	}
	return db
}
