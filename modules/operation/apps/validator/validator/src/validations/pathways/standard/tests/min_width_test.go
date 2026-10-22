package pathways_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/pathways/standard/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestMinWidthValid(t *testing.T) {
	const id = "pathway_min_width_positive"
	for _, tc := range []struct {
		value any
		count int
	}{{"1", 0}, {"2.5", 0}, {"0", 1}, {"0.5", 1}, {"-1", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "min_width": tc.value}, config)
			if err := checks.MinWidthValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "min_width", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.MinWidthValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "min_width", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "min_width", checks.MinWidthValid, map[string]any{"min_width": "bad", "pathway_mode": "2"})
}
