package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopDescValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_desc") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var stopDesc *string
			if tc.Value != nil {
				stopDesc = tc.Value
			}
			stop := &types.Stop{StopDesc: stopDesc}
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}
			validations.StopDescValidation(stop, tc.Row, &types.StopsRules{StopDesc: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_desc") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopDesc: nil}
			validations.StopDescValidation(stop, tc.Row, &types.StopsRules{StopDesc: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopDesc: nil}
		validations.StopDescValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})

	t.Run("DuplicateStopDesc", func(t *testing.T) {
		services.AppMessageService.Clear()
		val := "Duplicate"
		stop := &types.Stop{StopDesc: &val, StopName: &val}
		validations.StopDescValidation(stop, 5, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DuplicateStopDesc", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "DuplicateStopDesc", types.SEVERITY_WARNING)
	})
}
