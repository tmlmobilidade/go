package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllVehicleRegistrationDateValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("registration_date") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{RegistrationDate: nil}
			rules := &types.VehiclesRules{RegistrationDate: types.RuleConfig{Severity: tc.Severity}}

			validations.RegistrationDateValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{RegistrationDate: lib.Ptr("20240101")}
		rules := &types.VehiclesRules{RegistrationDate: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.RegistrationDateValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

func TestRegistrationDateValidation_ValidDates(t *testing.T) {
	for _, date := range test_helpers.GetDateValidOptions() {
		t.Run(date, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{RegistrationDate: lib.Ptr(date)}
			rules := &types.VehiclesRules{RegistrationDate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.RegistrationDateValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, date, types.SEVERITY_ERROR)
		})
	}
}

func TestRegistrationDateValidation_InvalidDates(t *testing.T) {
	dates := append(test_helpers.GetInvalidDateOptions(), "20241301", "20240230", "notadate")

	for _, date := range dates {
		t.Run(date, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{RegistrationDate: lib.Ptr(date)}
			rules := &types.VehiclesRules{RegistrationDate: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.RegistrationDateValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, date, types.SEVERITY_ERROR)
		})
	}
}
