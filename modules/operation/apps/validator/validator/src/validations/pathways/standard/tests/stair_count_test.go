package pathways_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/pathways/standard/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestStairCountValid(t *testing.T) {
	const id = "pathways_stair_count_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"65535", 0}, {"65536", 1}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "stair_count": tc.value}, config)
			if err := checks.StairCountValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "stair_count", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.StairCountValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "stair_count", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "stair_count", checks.StairCountValid, map[string]any{"stair_count": "bad", "pathway_mode": "2"})
}
