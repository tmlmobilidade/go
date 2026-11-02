package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
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
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"emission": tc.value}, config)
			if err := standard.EmissionValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "emission", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.VehiclesCheckInvalid(t, id, "emission", standard.EmissionValid, map[string]any{"emission": "euro VI"})
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
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"emission": "Euro I"}, config)
			if err := standard.EmissionValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "emission", types.SEVERITY_ERROR, tc.count)
		})
	}
}
