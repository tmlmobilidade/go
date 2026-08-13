package shapes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
	"testing"
)

func TestAllShapePtLonValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetFloat64ValidOptions()
	invalidOption := float64(200.0) // out of range
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("shape_pt_lon") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var shapePtLon *float64
			if tc.Name == "Invalid_Value" {
				shapePtLon = &invalidOption
			} else if tc.Value != nil {
				shapePtLon = &validOptions[0]
			} else {
				shapePtLon = nil
			}
			validations.ShapePtLonValidation(&types.Shape{ShapePtLon: shapePtLon}, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
