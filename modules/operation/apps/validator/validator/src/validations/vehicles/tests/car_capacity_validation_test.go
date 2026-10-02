package vehicles

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"strconv"
	"testing"
)

func TestAllCarCapacityValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("car_capacity") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{CarCapacity: nil}
			rules := &types.VehiclesRules{CarCapacity: types.RuleConfig{Severity: tc.Severity}}

			validations.CarCapacityValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{CarCapacity: lib.Ptr(1)}
		rules := &types.VehiclesRules{CarCapacity: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.CarCapacityValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Rules_Ignores_Missing_Value", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.CarCapacityValidation(&types.Vehicle{CarCapacity: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Rules_Ignores_Missing_Value", types.SEVERITY_ERROR)
	})
}

func TestCarCapacityValidation_NonNegative(t *testing.T) {
	// Zero is meaningful here: it means the vehicle unit cannot carry any.
	for _, value := range test_helpers.GetValidIntOptions() {
		t.Run("Valid_"+strconv.Itoa(value), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{CarCapacity: lib.Ptr(value)}
			rules := &types.VehiclesRules{CarCapacity: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.CarCapacityValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, strconv.Itoa(value), types.SEVERITY_ERROR)
		})
	}

	for _, value := range test_helpers.GetInvalidIntOptions() {
		t.Run("Negative_"+strconv.Itoa(value), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{CarCapacity: lib.Ptr(value)}
			rules := &types.VehiclesRules{CarCapacity: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.CarCapacityValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, strconv.Itoa(value), types.SEVERITY_ERROR)
		})
	}
}
