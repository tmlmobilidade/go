package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllVehicleMakeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("make") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Make: nil}
			rules := &types.VehiclesRules{Make: types.RuleConfig{Severity: tc.Severity}}

			validations.MakeValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Valid_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Make: lib.Ptr("some_value")}
		rules := &types.VehiclesRules{Make: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

		validations.MakeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Present", types.SEVERITY_ERROR)
	})

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Make: lib.Ptr("some_value")}
		rules := &types.VehiclesRules{Make: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.MakeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Rules_Ignores_Missing_Value", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.MakeValidation(&types.Vehicle{Make: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Rules_Ignores_Missing_Value", types.SEVERITY_ERROR)
	})
}
