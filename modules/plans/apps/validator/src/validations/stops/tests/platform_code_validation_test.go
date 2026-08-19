package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllPlatformCodeValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("platform_code") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var platformCode *string
			if tc.Value != nil {
				platformCode = tc.Value
			}
			stop := &types.Stop{PlatformCode: platformCode}
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}
			validations.PlatformCodeValidation(stop, tc.Row, &types.StopsRules{PlatformCode: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("platform_code") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{PlatformCode: nil}
			validations.PlatformCodeValidation(stop, tc.Row, &types.StopsRules{PlatformCode: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

	t.Run("DefaultSeverity", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{PlatformCode: nil}
		validations.PlatformCodeValidation(stop, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "DefaultSeverity", types.SEVERITY_ERROR)
	})
}
