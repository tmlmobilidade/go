package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllPublicVisibleValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("public_visible", []int{0, 1}) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var publicVisible *int
			if tc.Value != nil {
				publicVisible = tc.Value.(*int)
			}
			stop := &types.Stop{PublicVisible: publicVisible}
			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}

			validations.PublicVisibleValidation(stop, tc.Row, &types.StopsRules{PublicVisible: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("public_visible") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{PublicVisible: nil}
			validations.PublicVisibleValidation(stop, tc.Row, &types.StopsRules{PublicVisible: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
