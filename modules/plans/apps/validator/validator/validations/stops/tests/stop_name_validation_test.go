package stops

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestAllStopNameValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("stop_name") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			stop := &types.Stop{StopName: tc.Value, LocationType: lib.Ptr(0)}

			if tc.Name == "Required" {
				stop = &types.Stop{StopName: nil, LocationType: lib.Ptr(0)}
			}
			if tc.Name == "Invalid_Value" {
				stop = &types.Stop{StopName: lib.Ptr(""), LocationType: lib.Ptr(0)}
			}

			validations.StopNameValidation(stop, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}

	for _, tc := range test_helpers.GetGenericSeverityTestCases("stop_name") {
		if tc.Name == "Severity_Warning_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			stop := &types.Stop{StopName: nil, LocationType: lib.Ptr(0)}
			validations.StopNameValidation(stop, tc.Row, &types.StopsRules{StopName: types.RuleConfig{Severity: tc.Severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, tc.Severity)
		})
	}

	t.Run("Optional_LocationType3", func(t *testing.T) {
		services.AppMessageService.Clear()
		stop := &types.Stop{StopName: nil, LocationType: lib.Ptr(3)}
		validations.StopNameValidation(stop, 2, nil)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "Optional_LocationType3", types.SEVERITY_ERROR)
	})

}
