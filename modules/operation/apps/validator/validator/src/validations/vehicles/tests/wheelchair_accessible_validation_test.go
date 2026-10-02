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

func TestAllWheelchairAccessibleValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("wheelchair_accessible") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{WheelchairAccessible: nil}
			rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: tc.Severity}}

			validations.WheelchairAccessibleValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{WheelchairAccessible: lib.Ptr(1)}
		rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.WheelchairAccessibleValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

func TestWheelchairAccessibleValidation_Options(t *testing.T) {
	for _, option := range test_helpers.GetThreeStateValidOptions() {
		t.Run("Valid_"+strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{WheelchairAccessible: lib.Ptr(option)}
			rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.WheelchairAccessibleValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}

	for _, option := range []int{-1, 3, 999} {
		t.Run("Invalid_"+strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{WheelchairAccessible: lib.Ptr(option)}
			rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.WheelchairAccessibleValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}
}

func TestWheelchairAccessibleValidation_AllowedOptionsRule(t *testing.T) {
	t.Run("Not_Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"1", "2"}
		vehicle := &types.Vehicle{WheelchairAccessible: lib.Ptr(0)}
		rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.WheelchairAccessibleValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("All_Options_Allows_Everything_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{types.ALL_OPTIONS}
		vehicle := &types.Vehicle{WheelchairAccessible: lib.Ptr(0)}
		rules := &types.VehiclesRules{WheelchairAccessible: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.WheelchairAccessibleValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "All_Options_Allows_Everything_Valid", types.SEVERITY_ERROR)
	})
}
