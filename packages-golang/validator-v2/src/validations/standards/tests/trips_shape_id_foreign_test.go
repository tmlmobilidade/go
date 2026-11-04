package standard_test

import (
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
)

func TestShapeIdForeign(t *testing.T) {
	for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE} {
		for _, tc := range []struct {
			name    string
			value   any
			missing bool
			count   int
		}{{"existing_with_duplicate_points", "R1_0", false, 0}, {"empty", "", false, 0}, {"null", nil, false, 0}, {"missing_column", nil, true, 0}, {"unknown", "missing", false, 1}, {"sql_literal", "' OR 1=1 --", false, 1}} {
			t.Run(string(severity)+"/"+tc.name, func(t *testing.T) {
				missing := ""
				if tc.missing {
					missing = "shape_id"
				}
				_, tables := testutil.Fixture(t, "P1", tc.value, missing)

				c := &testutil.Collector{}
				if err := standard.ShapeIdForeign(context.NewRuleContext("trips_shape_id_foreign", tables, rules.RuleContext{Severity: severity}, c)); err != nil {
					t.Fatal(err)
				}
				count := tc.count
				if severity == rules.SEVERITY_IGNORE {
					count = 0
				}
				testutil.AssertMessages(t, c, "trips_shape_id_foreign", "shape_id", severity, count)
			})
		}
	}
	testutil.QueryError(t, standard.ShapeIdForeign)
	t.Run("lookup_error", func(t *testing.T) {
		db, tables := testutil.Fixture(t, "P1", "R1_0", "")
		if _, err := db.Exec("DROP TABLE shapes"); err != nil {
			t.Fatal(err)
		}
		c := &testutil.Collector{}
		if err := standard.ShapeIdForeign(context.NewRuleContext("trips_shape_id_foreign", tables, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, c)); err == nil {
			t.Fatal("expected lookup error")
		}
		testutil.AssertMessages(t, c, "trips_shape_id_foreign", "shape_id", rules.SEVERITY_ERROR, 0)
	})
}
