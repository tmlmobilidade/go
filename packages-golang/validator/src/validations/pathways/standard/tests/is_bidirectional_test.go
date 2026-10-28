package pathways_standard_test

import (
	"fmt"
	"main/types"
	checks "main/validations/pathways/standard/checks"
	testutils "main/validations/pathways/utils"
	"testing"
)

func TestIsBidirectionalValid(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1", 0}, {"2", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"pathway_mode": "2", "is_bidirectional": tc.value}, config)
			if err := checks.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "is_bidirectional", checks.IsBidirectionalValid, map[string]any{"is_bidirectional": "bad", "pathway_mode": "2"})
}
func TestIsBidirectionalOptions(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"0"}, 0}, {[]string{"9"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		_, ctx := testutils.Fixture(t, map[string]any{"is_bidirectional": "0"}, config)
		if err := checks.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
	}
}
func TestExitGateDirection(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		mode     any
		wildcard bool
		count    int
	}{{"7", false, 1}, {"7", true, 0}, {"1", false, 0}, {nil, false, 0}, {"bad", false, 0}} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		if tc.wildcard {
			options := []string{types.ALL_OPTIONS}
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &options})
		}
		_, ctx := testutils.Fixture(t, map[string]any{"is_bidirectional": "1", "pathway_mode": tc.mode}, config)
		if err := checks.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
	}
}
