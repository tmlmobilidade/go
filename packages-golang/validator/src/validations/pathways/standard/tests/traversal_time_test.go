package pathways_standard_test

import (
	"fmt"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/utils"
	"main/types"
	"testing"
)

func TestTraversalTimeValid(t *testing.T) {
	const id = "pathways_traversal_time_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"25", 0}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "traversal_time": tc.value}, config)
			if err := checks.TraversalTimeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "traversal_time", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.TraversalTimeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "traversal_time", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "traversal_time", checks.TraversalTimeValid, map[string]any{"traversal_time": "bad", "pathway_mode": "2"})
}
