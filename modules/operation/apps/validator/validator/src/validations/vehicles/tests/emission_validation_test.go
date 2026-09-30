package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

var emissionValidOptions = []string{"Euro I", "Euro II", "Euro III", "Euro IV", "Euro V", "Euro VI", "Euro VII", "N/A"}

func TestAllVehicleEmissionValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("emission") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Emission: nil}
			rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: tc.Severity}}

			validations.EmissionValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Emission: lib.Ptr("Euro VI")}
		rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.EmissionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

func TestEmissionValidation_ValidOptions(t *testing.T) {
	for _, option := range emissionValidOptions {
		t.Run(option, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Emission: lib.Ptr(option)}
			rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.EmissionValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, option, types.SEVERITY_ERROR)
		})
	}
}

func TestEmissionValidation_InvalidOptions(t *testing.T) {
	// The enum is matched exactly, so casing and numeric variants are rejected.
	for _, option := range []string{"euro vi", "EURO VI", "Euro 6", "Euro VIII", "6", "n/a", ""} {
		t.Run("Invalid_"+option, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Emission: lib.Ptr(option)}
			rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.EmissionValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, option, types.SEVERITY_ERROR)
		})
	}
}

func TestEmissionValidation_AllowedOptionsRule(t *testing.T) {
	t.Run("Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"Euro VI", "Euro VII"}
		vehicle := &types.Vehicle{Emission: lib.Ptr("Euro VII")}
		rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.EmissionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("Not_Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"Euro VI", "Euro VII"}
		vehicle := &types.Vehicle{Emission: lib.Ptr("Euro I")}
		rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.EmissionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("All_Options_Allows_Everything_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{types.ALL_OPTIONS}
		vehicle := &types.Vehicle{Emission: lib.Ptr("Euro I")}
		rules := &types.VehiclesRules{Emission: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.EmissionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "All_Options_Allows_Everything_Valid", types.SEVERITY_ERROR)
	})
}
