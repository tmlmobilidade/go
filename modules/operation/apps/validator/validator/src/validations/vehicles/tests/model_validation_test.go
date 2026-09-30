package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllVehicleModelValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("model") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Model: nil}
			rules := &types.VehiclesRules{Model: types.RuleConfig{Severity: tc.Severity}}

			validations.ModelValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Valid_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Model: lib.Ptr("some_value")}
		rules := &types.VehiclesRules{Model: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

		validations.ModelValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Present", types.SEVERITY_ERROR)
	})

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Model: lib.Ptr("some_value")}
		rules := &types.VehiclesRules{Model: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.ModelValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Rules_Ignores_Missing_Value", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ModelValidation(&types.Vehicle{Model: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Rules_Ignores_Missing_Value", types.SEVERITY_ERROR)
	})
}
