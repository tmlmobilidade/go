package pathways_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/pathways/standard/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestLengthValid(t *testing.T) {
	const id = "pathways_length_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1.5", 0}, {"-1", 1}, {"bad", 1}, {"1e50", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "length": tc.value}, config)
			if err := checks.LengthValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "length", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.LengthValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "length", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "length", checks.LengthValid, map[string]any{"length": "bad", "pathway_mode": "2"})
}
