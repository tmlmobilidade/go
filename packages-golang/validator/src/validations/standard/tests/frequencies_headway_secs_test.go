package standard_test

import (
	"fmt"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestHeadwaySecsValid(t *testing.T) {
	const id = "frequencies_headway_secs_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"1", 0}, {"0600", 0}, {"0", 1}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {"99999999999999999999999", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FrequenciesFixture(t, map[string]any{"headway_secs": tc.value}, config)
			if err := standard.HeadwaySecsValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FrequenciesAssertFindings(t, id, "headway_secs", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FrequenciesFixture(t, nil, config)
		if err := standard.HeadwaySecsValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FrequenciesAssertFindings(t, id, "headway_secs", types.SEVERITY_ERROR, 0)
	})
	validationutils.FrequenciesCheckInvalid(t, id, "headway_secs", standard.HeadwaySecsValid, map[string]any{"headway_secs": "bad"})
}
