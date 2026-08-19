package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllZoneIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("zone_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{ZoneId: tc.Value}
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}
			validations.ZoneIdValidation(stop, tc.Row, &types.StopsRules{ZoneId: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("zone_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{ZoneId: nil}
			validations.ZoneIdValidation(stop, tc.Row, &types.StopsRules{ZoneId: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
