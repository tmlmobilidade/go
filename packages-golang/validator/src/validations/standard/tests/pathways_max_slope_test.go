package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestMaxSlopeValid(t *testing.T) {
	const id = "pathways_max_slope_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"0.1", 1}, {"-0.2", 1}, {"0.0", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": "2", "max_slope": tc.value}, config)
			if err := standard.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, nil, config)
		if err := standard.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, 0)
	})
	validationutils.PathwaysCheckInvalid(t, id, "max_slope", standard.MaxSlopeValid, map[string]any{"max_slope": "bad", "pathway_mode": "2"})
}
func TestSlopeModes(t *testing.T) {
	const id = "pathways_max_slope_valid"
	for _, mode := range []any{"1", "3", nil, "bad"} {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, map[string]any{"max_slope": "-0.2", "pathway_mode": mode}, config)
		if err := standard.MaxSlopeValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, 0)
	}
}
