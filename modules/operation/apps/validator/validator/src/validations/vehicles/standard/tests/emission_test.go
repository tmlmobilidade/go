package vehicles_standard_test

import (
	"main/types"
	checks "main/validations/vehicles/standard/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestEmissionValid(t *testing.T) {
	const id = "vehicles_emission_valid"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"Euro I", 0},
		{"Euro II", 0},
		{"Euro III", 0},
		{"Euro IV", 0},
		{"Euro V", 0},
		{"Euro VI", 0},
		{"Euro VII", 0},
		{"N/A", 0},
		{"euro VI", 1},
		{"Euro VIII", 1},
		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"emission": tc.value}, config)
			if err := checks.EmissionValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "emission", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "emission", checks.EmissionValid, map[string]any{"emission": "euro VI"})
	for _, tc := range []struct {
		name    string
		options []string
		count   int
	}{
		{"Allowed", []string{"Euro I"}, 0},
		{"NotAllowed", []string{"other"}, 1},
		{"All", []string{types.ALL_OPTIONS}, 0},
		{"EmptyOptions", []string{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := testutils.Fixture(t, map[string]any{"emission": "Euro I"}, config)
			if err := checks.EmissionValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "emission", types.SEVERITY_ERROR, tc.count)
		})
	}
}
