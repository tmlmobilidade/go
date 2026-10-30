package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestPathwayModeValid(t *testing.T) {
	const id = "pathways_pathway_mode_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"1", 0}, {"7", 0}, {"0", 1}, {"8", 1}, {"bad", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": tc.value}, config)
			if err := standard.PathwayModeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "pathway_mode", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, nil, config)
		if err := standard.PathwayModeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "pathway_mode", types.SEVERITY_ERROR, 0)
	})
	validationutils.PathwaysCheckInvalid(t, id, "pathway_mode", standard.PathwayModeValid, map[string]any{"pathway_mode": "bad"})
}
func TestPathwayModeOptions(t *testing.T) {
	const id = "pathways_pathway_mode_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"1"}, 0}, {[]string{"9"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": "1"}, config)
		if err := standard.PathwayModeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "pathway_mode", types.SEVERITY_ERROR, tc.count)
	}
}
