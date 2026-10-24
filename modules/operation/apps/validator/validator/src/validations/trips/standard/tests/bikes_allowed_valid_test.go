package trips_standard_test

import (
	"main/types"
	checks "main/validations/trips/standard/checks"
	testutils "main/validations/trips/utils"
	"testing"
)

func TestBikesAllowedValid(t *testing.T) {
	const id = "trips_bikes_allowed_valid"
	for _, tc := range []struct {
		value string
		count int
	}{{"0", 0},
		{"1", 0},
		{"2", 0}, {"3", 1}, {"-1", 1}, {"bad", 1}, {"1.5", 1}, {"", 0}} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"bikes_allowed": tc.value}, config)
			if err := checks.BikesAllowedValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "bikes_allowed", types.SEVERITY_ERROR, tc.count)
		})
	}
	for _, tc := range []struct {
		name    string
		options []string
		count   int
	}{{"Allowed", []string{"1"}, 0}, {"Rejected", []string{"0"}, 1}, {"All", []string{types.ALL_OPTIONS}, 0}, {"Empty", []string{}, 1}} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := testutils.Fixture(t, map[string]any{"bikes_allowed": "1"}, config)
			if err := checks.BikesAllowedValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "bikes_allowed", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "bikes_allowed", checks.BikesAllowedValid, map[string]any{"bikes_allowed": "bad"})
}
