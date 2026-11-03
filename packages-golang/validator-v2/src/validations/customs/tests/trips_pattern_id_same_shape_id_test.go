package custom_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	custom "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/checks"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/utils"
)

func TestPatternIdSameShapeId(t *testing.T) {
	for _, severity := range []rules.Severities{rules.SEVERITY_ERROR, rules.SEVERITY_WARNING, rules.SEVERITY_INFO, rules.SEVERITY_IGNORE, rules.SEVERITY_FORBIDDEN} {
		for _, tc := range []struct {
			name           string
			pattern, shape any
			missing        string
			count          int
		}{
			{"matching", "R1_0", "R1_0", "", 0}, {"mismatch", "P1", "R1_0", "", 1}, {"missing_pattern", "", "R1_0", "", 0}, {"missing_shape", "P1", "", "", 0}, {"null_pattern", nil, "R1_0", "", 0}, {"null_shape", "P1", nil, "", 0}, {"missing_pattern_column", nil, "R1_0", "pattern_id", 0}, {"missing_shape_column", "P1", nil, "shape_id", 0},
		} {
			t.Run(string(severity)+"/"+tc.name, func(t *testing.T) {
				_, ctx := testutil.Fixture(t, tc.pattern, tc.shape, tc.missing)

				c := &testutil.Collector{}
				if err := custom.PatternIdSameShapeId(ctx, &rules.RuleContext{Severity: severity}, c); err != nil {
					t.Fatal(err)
				}
				count := tc.count
				if severity == rules.SEVERITY_IGNORE || severity == rules.SEVERITY_FORBIDDEN {
					count = 0
				}
				testutil.AssertMessages(t, c, "trips_pattern_id_same_shape_id", "pattern_id", severity, count)
			})
		}
	}
	testutil.QueryError(t, custom.PatternIdSameShapeId)

}
