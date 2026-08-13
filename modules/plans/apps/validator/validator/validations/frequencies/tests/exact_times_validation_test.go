package frequencies

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func TestAllExactTimesValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("exact_times", validOptions) {
		if tc.Name == "Missing_Value_Required" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var exactTimes *int
			if valPtr, ok := tc.Value.(*int); ok && valPtr != nil {
				exactTimes = valPtr
			}
			endTime := "10:00:00"
			startTime := "09:00:00"
			headwaySecs := 3600
			frequency := &types.Frequencies{ExactTimes: exactTimes, EndTime: &endTime, StartTime: &startTime, HeadwaySecs: &headwaySecs}
			validations.ExactTimesValidation(frequency, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Forbidden_Present", func(t *testing.T) {
		services.AppMessageService.Clear()
		frequency := &types.Frequencies{ExactTimes: lib.Ptr(0)}
		validations.ExactTimesValidation(frequency, 1, &types.FrequenciesRules{ExactTimes: types.RuleConfig{Severity: types.SEVERITY_FORBIDDEN}})
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Forbidden_Present", types.SEVERITY_FORBIDDEN)
	})
}
