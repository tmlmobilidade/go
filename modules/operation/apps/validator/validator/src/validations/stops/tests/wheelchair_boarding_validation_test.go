package stops

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllWheelchairBoardingValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetThreeStateValidOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("wheelchair_boarding", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var wheelchairBoarding *int
			if tc.Value != nil {
				if ptr, ok := tc.Value.(*int); ok {
					wheelchairBoarding = ptr
				}
			}

			var severity types.Severity
			if tc.ExpectedErrors > 0 {
				severity = types.SEVERITY_ERROR
			} else {
				severity = types.SEVERITY_WARNING
			}
			stop := &types.Stop{WheelchairBoarding: wheelchairBoarding}
			validations.WheelchairBoardingValidation(stop, tc.Row, &types.StopsRules{WheelchairBoarding: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
