package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllDepartureTimeValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimeOptions()
	invalidOptions := lib.Ptr("") //test_helpers.GetInvalidTimeOptions() because dont verify invalid time for value all time is valid
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("departure_time") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var departureTime *string
			if tc.Name == "Invalid_Value" {
				departureTime = invalidOptions
			} else if tc.Value != nil {
				departureTime = &validOptions[0]
			} else {
				departureTime = nil
			}

			var rules *types.StopTimesRules
			if tc.ExpectedWarnings > 0 {
				rules = &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: types.SEVERITY_WARNING}}
			} else {
				rules = &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: types.SEVERITY_ERROR}}
			}

			validations.DepartureTimeValidation(&types.StopTime{DepartureTime: departureTime}, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	// Missing departure_time is reported at the configured severity; ignore,
	// forbidden and unset stay silent.
	for _, tc := range []struct {
		severity         types.Severity
		expectedErrors   int
		expectedWarnings int
	}{
		{types.SEVERITY_ERROR, 1, 0},
		{types.SEVERITY_WARNING, 0, 1},
		{types.SEVERITY_IGNORE, 0, 0},
		{types.SEVERITY_FORBIDDEN, 0, 0},
		{"", 0, 0},
	} {
		t.Run("Required_Missing_"+string(tc.severity), func(t *testing.T) {
			services.AppMessageService.Clear()
			var rules *types.StopTimesRules
			if tc.severity != "" {
				rules = &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: tc.severity}}
			}
			validations.DepartureTimeValidation(&types.StopTime{DepartureTime: nil}, 1, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedErrors, "Required_Missing", types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.expectedWarnings, "Required_Missing", types.SEVERITY_WARNING)
		})
	}

	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()
		rules := &types.StopTimesRules{DepartureTime: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}}
		validations.DepartureTimeValidation(&types.StopTime{DepartureTime: lib.Ptr("07:00:00")}, 1, rules)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Forbidden_Present", types.SEVERITY_ERROR)
	})
}
