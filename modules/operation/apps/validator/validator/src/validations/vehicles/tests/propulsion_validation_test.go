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

var propulsionValidOptions = []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 101, 102, 103, 104, 105, 106}

func TestAllVehiclePropulsionValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericSeverityTestCases("propulsion") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Propulsion: nil}
			rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: tc.Severity}}

			validations.PropulsionValidation(vehicle, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, lib.IfThenElse(tc.Severity == types.SEVERITY_ERROR, tc.ExpectedErrors, tc.ExpectedWarnings), tc.Name, tc.Severity)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()

		vehicle := &types.Vehicle{Propulsion: lib.Ptr(2)}
		rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}

		validations.PropulsionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}

func TestPropulsionValidation_ValidOptions(t *testing.T) {
	for _, option := range propulsionValidOptions {
		t.Run(strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Propulsion: lib.Ptr(option)}
			rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.PropulsionValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 0, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}
}

func TestPropulsionValidation_InvalidOptions(t *testing.T) {
	for _, option := range []int{-1, 11, 100, 107, 999} {
		t.Run(strconv.Itoa(option), func(t *testing.T) {
			services.AppMessageService.Clear()

			vehicle := &types.Vehicle{Propulsion: lib.Ptr(option)}
			rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

			validations.PropulsionValidation(vehicle, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, 1, strconv.Itoa(option), types.SEVERITY_ERROR)
		})
	}
}

func TestPropulsionValidation_AllowedOptionsRule(t *testing.T) {
	t.Run("Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"5", "6"}
		vehicle := &types.Vehicle{Propulsion: lib.Ptr(6)}
		rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.PropulsionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("Not_Allowed_Option", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{"5", "6"}
		vehicle := &types.Vehicle{Propulsion: lib.Ptr(2)}
		rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.PropulsionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Not_Allowed_Option", types.SEVERITY_ERROR)
	})

	t.Run("All_Options_Allows_Everything_Valid", func(t *testing.T) {
		services.AppMessageService.Clear()

		allowed := []string{types.ALL_OPTIONS}
		vehicle := &types.Vehicle{Propulsion: lib.Ptr(106)}
		rules := &types.VehiclesRules{Propulsion: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: &allowed}}

		validations.PropulsionValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "All_Options_Allows_Everything_Valid", types.SEVERITY_ERROR)
	})
}
