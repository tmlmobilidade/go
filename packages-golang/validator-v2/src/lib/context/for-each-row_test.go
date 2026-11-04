package context_test

import (
	"errors"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	graph "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
)

func TestForEachRowPropagatesOutcomesAndIsolatesConfiguration(t *testing.T) {
	db, tables := testutil.Fixture(t, "P1", "S1", "")
	if _, err := db.Exec("INSERT INTO trips VALUES ('P2','S2')"); err != nil {
		t.Fatal(err)
	}
	options := []string{"original"}
	config := rules.RuleContext{Severity: rules.SEVERITY_ERROR, Options: &options}
	for name, outcome := range map[string]graph.Status{"skipped": graph.Skipped, "failed": graph.Failed} {
		t.Run(name, func(t *testing.T) {
			ctx := context.NewRuleContext("test_rule", tables, config, &testutil.Collector{})
			count := 0
			err := context.ForEachRow(ctx, "trips", []string{"pattern_id"}, func(row *context.ValidationContext) error {
				if row.Field != "pattern_id" || row.Config.Severity != rules.SEVERITY_ERROR || (*row.Config.Options)[0] != "original" || row.Failed || row.Skipped {
					t.Fatalf("row inherited another row's changes: %+v", row)
				}
				if count == 0 {
					row.Field = "other"
					row.Config.Severity = rules.SEVERITY_WARNING
					(*row.Config.Options)[0] = "changed"
					row.Skipped = outcome == graph.Skipped
					row.Failed = outcome == graph.Failed
				}
				count++
				return nil
			})
			if err != nil {
				t.Fatal(err)
			}
			if count != 2 || context.Status(ctx) != outcome || options[0] != "original" {
				t.Fatalf("outcome/configuration lost: rows=%d, status=%v, options=%v", count, context.Status(ctx), options)
			}
		})
	}
}

func TestForEachRowRetainsFailureLocation(t *testing.T) {
	_, tables := testutil.Fixture(t, "P1", "S1", "")
	want := errors.New("lookup failed")
	for _, panicCheck := range []bool{false, true} {
		ctx := context.NewRuleContext("test_rule", tables, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, &testutil.Collector{})
		err := context.ForEachRow(ctx, "trips", []string{"pattern_id"}, func(row *context.ValidationContext) error {
			row.Field = "shape_id"
			if panicCheck {
				panic("lookup failed")
			}
			return want
		})
		source, ok := context.RowErrorDetails(err)
		if !ok || source.Table != "trips" || source.Field != "shape_id" || source.Row != 1 || context.Status(ctx) != graph.Failed {
			t.Fatalf("failure location was lost: %v, %+v", err, source)
		}
		if !panicCheck && !errors.Is(err, want) {
			t.Fatalf("original error was lost: %v", err)
		}
	}
}
