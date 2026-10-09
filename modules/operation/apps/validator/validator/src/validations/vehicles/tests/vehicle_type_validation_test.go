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

// vehicle_type mirrors routes.txt route_type.
var vehicleTypeValidOptions = []int{0, 1, 2, 3, 4, 5, 6, 7, 11, 12}

func TestAllVehicleTypeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("vehicle_type") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{VehicleType: nil}
			rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: tc.Severity}}

			validations.VehicleTypeValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{VehicleType: lib.Ptr(3)}
		rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.VehicleTypeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

func TestVehicleTypeValidation_ValidOptions(t *testing.T) {
	for _, option := range vehicleTypeValidOptions {
		t.Run(strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{VehicleType: lib.Ptr(option)}
			rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.VehicleTypeValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}
}

func TestVehicleTypeValidation_InvalidOptions(t *testing.T) {
	for _, option := range []int{-1, 8, 9, 10, 13, 999} {
		t.Run(strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{VehicleType: lib.Ptr(option)}
			rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.VehicleTypeValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}
}

func TestVehicleTypeValidation_AllowedOptionsRule(t *testing.T) {
	t.Run("Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"3", "4"}
		vehicle := &types.Vehicle{VehicleType: lib.Ptr(4)}
		rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.VehicleTypeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("Not_Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"3", "4"}
		vehicle := &types.Vehicle{VehicleType: lib.Ptr(1)}
		rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.VehicleTypeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("All_Options_Allows_Everything_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{types.ALL_OPTIONS}
		vehicle := &types.Vehicle{VehicleType: lib.Ptr(12)}
		rules := &types.VehiclesRules{VehicleType: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.VehicleTypeValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "All_Options_Allows_Everything_Valid", types.SEVERITY_ERROR)
	})
}
