package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllHasBenchValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFourStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("has_bench", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var hasBench *int
			if tc.Value != nil {
				hasBench = tc.Value.(*int)
			}

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}
			validations.HasBenchValidation(&types.Stop{HasBench: hasBench}, tc.Row, &types.StopsRules{HasBench: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, severity)
		})
	}
	for _, tc := range test_helpers.GetGenericSeverityTestCases("has_bench") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.HasBenchValidation(&types.Stop{}, tc.Row, &types.StopsRules{HasBench: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
	t.Run("Default_Severity", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.HasBenchValidation(&types.Stop{}, 1, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Default severity should not error", types.SEVERITY_ERROR)
	})
}
