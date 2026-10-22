package pathways_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/pathways/standard/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestMaxSlopeValid(t *testing.T) {
	const id = "pathways_max_slope_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"0.1", 1}, {"-0.2", 1}, {"0.0", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "max_slope": tc.value}, config)
			if err := checks.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "max_slope", checks.MaxSlopeValid, map[string]any{"max_slope": "bad", "pathway_mode": "2"})
}
func TestSlopeModes(t *testing.T) {
	const id = "pathways_max_slope_valid"
	for _, mode := range []any{"1", "3", nil, "bad"} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, map[string]any{"max_slope": "-0.2", "pathway_mode": mode}, config)
		if err := checks.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, 0)
	}
}
