package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestIsBidirectionalValid(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1", 0}, {"2", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": "2", "is_bidirectional": tc.value}, config)
			if err := standard.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, nil, config)
		if err := standard.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, 0)
	})
	validationutils.PathwaysCheckInvalid(t, id, "is_bidirectional", standard.IsBidirectionalValid, map[string]any{"is_bidirectional": "bad", "pathway_mode": "2"})
}
func TestIsBidirectionalOptions(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"0"}, 0}, {[]string{"9"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		_, ctx := validationutils.PathwaysFixture(t, map[string]any{"is_bidirectional": "0"}, config)
		if err := standard.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
	}
}
func TestExitGateDirection(t *testing.T) {
	const id = "pathways_is_bidirectional_valid"
	for _, tc := range []struct {
		mode     any
		wildcard bool
		count    int
	}{{"7", false, 1}, {"7", true, 0}, {"1", false, 0}, {nil, false, 0}, {"bad", false, 0}} {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		if tc.wildcard {
			options := []string{types.ALL_OPTIONS}
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &options})
		}
		_, ctx := validationutils.PathwaysFixture(t, map[string]any{"is_bidirectional": "1", "pathway_mode": tc.mode}, config)
		if err := standard.IsBidirectionalValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "is_bidirectional", types.SEVERITY_ERROR, tc.count)
	}
}
