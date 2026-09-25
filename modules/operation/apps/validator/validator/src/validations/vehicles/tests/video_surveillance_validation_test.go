package tests

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/vehicles/validations"
	"testing"
)

func TestAllVideoSurveillanceValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetBinaryValidOptions()
	invalidOptions := test_helpers.GetInvalidIntOptions()
	for _, tc := range test_helpers.GetGenericEnumIntTestCases("video_surveillance", validOptions) {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var videoSurveillanceValue *int
			if tc.Name == "Invalid_Option" {
				videoSurveillanceValue = &invalidOptions[0]
			} else if tc.Value != nil {
				videoSurveillanceValue = &validOptions[0]
			} else {
				videoSurveillanceValue = nil
			}

			if tc.Name == "Missing_Value_Required" {
				videoSurveillanceValue = nil
			}

			tripRules := &types.VehiclesRules{
				VideoSurveillance: types.RuleConfig{Severity: types.SEVERITY_ERROR},
			}
			validations.VideoSurveillanceValidation(&types.Vehicle{VideoSurveillance: videoSurveillanceValue}, tc.Row, tripRules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
