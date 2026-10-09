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

func TestAllTotalCapacityValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("total_capacity") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{TotalCapacity: nil}
			rules := &types.VehiclesRules{TotalCapacity: types.RuleConfig{Severity: tc.Severity}}

			validations.TotalCapacityValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{TotalCapacity: lib.Ptr(1)}
		rules := &types.VehiclesRules{TotalCapacity: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.TotalCapacityValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})

	t.Run("Nil_Rules_Ignores_Missing_Value", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.TotalCapacityValidation(&types.Vehicle{TotalCapacity: nil}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Nil_Rules_Ignores_Missing_Value", types.SEVERITY_ERROR)
	})
}

func TestTotalCapacityValidation_NonNegative(t *testing.T) {
	// Zero is meaningful here: it means the vehicle unit cannot carry any.
	for _, value := range test_helpers.GetValidIntOptions() {
		t.Run("Valid_"+strconv.Itoa(value), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{TotalCapacity: lib.Ptr(value)}
			rules := &types.VehiclesRules{TotalCapacity: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.TotalCapacityValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, strconv.Itoa(value), types.SEVERITY_ERROR)
		})
	}

	for _, value := range test_helpers.GetInvalidIntOptions() {
		t.Run("Negative_"+strconv.Itoa(value), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{TotalCapacity: lib.Ptr(value)}
			rules := &types.VehiclesRules{TotalCapacity: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.TotalCapacityValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, strconv.Itoa(value), types.SEVERITY_ERROR)
		})
	}
}
