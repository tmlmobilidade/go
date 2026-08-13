package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopTimezoneValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidTimezones()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_timezone") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var stopTimezone *string
			if tc.Value != nil {
				stopTimezone = &validOptions[0]
			}
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			stop := &types.Stop{StopTimezone: stopTimezone}
			if tc.Name == "Invalid_Value" {
				stop = &types.Stop{}
			}

			validations.StopTimezoneValidation(stop, tc.Row, &types.StopsRules{StopTimezone: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_timezone") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopTimezone: nil}
			validations.StopTimezoneValidation(stop, tc.Row, &types.StopsRules{StopTimezone: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopTimezone: nil}
		validations.StopTimezoneValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})

	t.Run("InvalidTimezone", func(t *testing.T) {
		services.AppMessageService.Clear()
		tz := "Invalid/Timezone"
		stop := &types.Stop{StopTimezone: &tz}
		validations.StopTimezoneValidation(stop, 5, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "InvalidTimezone", types.SEVERITY_ERROR)
	})
}
