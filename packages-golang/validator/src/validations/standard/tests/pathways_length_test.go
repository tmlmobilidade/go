package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestLengthValid(t *testing.T) {
	const id = "pathways_length_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1.5", 0}, {"-1", 1}, {"bad", 1}, {"1e50", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.PathwaysFixture(t, map[string]any{"pathway_mode": "2", "length": tc.value}, config)
			if err := standard.LengthValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.PathwaysAssertFindings(t, id, "length", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, nil, config)
		if err := standard.LengthValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "length", types.SEVERITY_ERROR, 0)
	})
	validationutils.PathwaysCheckInvalid(t, id, "length", standard.LengthValid, map[string]any{"length": "bad", "pathway_mode": "2"})
}
