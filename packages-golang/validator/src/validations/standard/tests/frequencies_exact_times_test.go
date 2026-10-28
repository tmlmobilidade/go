package standard_test

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"strings"
	"testing"
)

func TestExactTimesValid(t *testing.T) {
	const id = "frequencies_exact_times_valid"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1", 0}, {"01", 0}, {"2", 1}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {"99999999999999999999999", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.FrequenciesFixture(t, map[string]any{"exact_times": tc.value}, config)
			if err := standard.ExactTimesValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.FrequenciesAssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.FrequenciesFixture(t, nil, config)
		if err := standard.ExactTimesValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FrequenciesAssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, 0)
	})
	validationutils.FrequenciesCheckInvalid(t, id, "exact_times", standard.ExactTimesValid, map[string]any{"exact_times": "bad"})
}
func TestExactTimesOptions(t *testing.T) {
	const id = "frequencies_exact_times_valid"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"1"}, 0}, {[]string{"0"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := validationutils.FrequenciesConfig(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		_, ctx := validationutils.FrequenciesFixture(t, map[string]any{"exact_times": "01"}, config)
		if err := standard.ExactTimesValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.FrequenciesAssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, tc.count)
		for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
			if strings.Contains(msg.Message, "%!") {
				t.Fatalf("bad placeholder: %s", msg.Message)
			}
		}
	}
}
