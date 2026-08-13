package stop_times

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllStopHeadsignValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_headsign") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var stopHeadsign *string
			if tc.Value != nil {
				stopHeadsign = lib.Ptr(*tc.Value)
			} else {
				stopHeadsign = nil
			}

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			rules := &types.StopTimesRules{StopHeadsign: types.RuleConfig{Severity: severity}}

			if tc.Name == "Invalid_Value" {
				stopTime := &types.StopTime{}
				validations.StopHeadsignValidation(stopTime, tc.Row, rules)
			} else {
				stopTime := &types.StopTime{StopHeadsign: stopHeadsign}
				validations.StopHeadsignValidation(stopTime, tc.Row, rules)
			}

			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_headsign") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stopTime := &types.StopTime{StopHeadsign: tc.Value.(*string)}
			validations.StopHeadsignValidation(stopTime, tc.Row, &types.StopTimesRules{StopHeadsign: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
