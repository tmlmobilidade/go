package frequencies_standard_test

import (
	"fmt"
	"main/services"
	"main/types"
	checks "main/validations/frequencies/standard/checks"
	testutils "main/validations/frequencies/utils"
	"strings"
	"testing"
)

func TestExactTimesValid(t *testing.T) {
	const id = "frequencies_exact_times_zero_when_timed_trip_uses_frequencies"
	for _, tc := range []struct {
		value any
		count int
	}{{"0", 0}, {"1", 0}, {"01", 0}, {"2", 1}, {"-1", 1}, {"1.5", 1}, {"bad", 1}, {"99999999999999999999999", 1}, {nil, 0}, {"", 0}} {
		t.Run(fmt.Sprint(tc.value), func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"exact_times": tc.value}, config)
			if err := checks.ExactTimesValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("MissingColumn", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, nil, config)
		if err := checks.ExactTimesValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, 0)
	})
	testutils.CheckInvalid(t, id, "exact_times", checks.ExactTimesValid, map[string]any{"exact_times": "bad"})
}
func TestExactTimesOptions(t *testing.T) {
	const id = "frequencies_exact_times_zero_when_timed_trip_uses_frequencies"
	for _, tc := range []struct {
		options []string
		count   int
	}{{[]string{"1"}, 0}, {[]string{"0"}, 1}, {[]string{types.ALL_OPTIONS}, 0}, {[]string{}, 1}} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
		_, ctx := testutils.Fixture(t, map[string]any{"exact_times": "01"}, config)
		if err := checks.ExactTimesValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "exact_times", types.SEVERITY_ERROR, tc.count)
		for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
			if strings.Contains(msg.Message, "%!") {
				t.Fatalf("bad placeholder: %s", msg.Message)
			}
		}
	}
}
