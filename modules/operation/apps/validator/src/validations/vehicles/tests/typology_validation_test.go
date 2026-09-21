package tests

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"

	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllTypologyValidationTestCases(t *testing.T) {
	validOptions := []string{"0.1", "0.2", "0.3", "1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "4.1", "4.2", "4.3", "7.1", "7.2", "7.3"}

	t.Run("Valid_Option_with_no_rules", func(t *testing.T) {
		services.AppMessageService.Clear()
		vehicle := &types.Vehicle{Typology: lib.Ptr("0.1")}
		validations.TypologyValidation(vehicle, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Option_with_no_rules", types.SEVERITY_ERROR)
	})
	t.Run("Valid_Option_with_rules", func(t *testing.T) {
		services.AppMessageService.Clear()
		vehicle := &types.Vehicle{Typology: lib.Ptr("0.1")}
		rules := &types.VehiclesRules{Typology: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: lib.Ptr(validOptions)}}
		validations.TypologyValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Valid_Option_with_rules", types.SEVERITY_ERROR)
	})
	t.Run("Invalid_Option_with_with_rules_error", func(t *testing.T) {
		services.AppMessageService.Clear()
		vehicle := &types.Vehicle{Typology: lib.Ptr("invalid")}
		rules := &types.VehiclesRules{Typology: types.RuleConfig{Severity: types.SEVERITY_ERROR, Options: lib.Ptr(validOptions)}}
		validations.TypologyValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Option_with_with_rules_error", types.SEVERITY_ERROR)
	})
	t.Run("Invalid_Option_with_with_rules_warning", func(t *testing.T) {
		services.AppMessageService.Clear()
		vehicle := &types.Vehicle{Typology: lib.Ptr("invalid")}
		rules := &types.VehiclesRules{Typology: types.RuleConfig{Severity: types.SEVERITY_WARNING, Options: lib.Ptr(validOptions)}}
		validations.TypologyValidation(vehicle, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Invalid_Option_with_with_rules_warning", types.SEVERITY_WARNING)
	})
}
