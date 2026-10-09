package frequencies

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func TestAllHeadwaySecsValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFloat32ValidOptions()
	invalidOptions := test_helpers.GetFloat32InvalidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("headway_secs") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var headwaySecs float32
			if tc.Name == "Invalid_Value" {
				headwaySecs = invalidOptions[0]
			} else if tc.Value != nil {
				headwaySecs = validOptions[1]
			} else {
				headwaySecs = 0
			}
			frequency := &types.Frequencies{HeadwaySecs: lib.Ptr(int(headwaySecs))}
			validations.HeadwaySecsValidation(frequency, tc.Row, nil)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}
