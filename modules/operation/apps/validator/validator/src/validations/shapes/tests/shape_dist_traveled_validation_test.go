package shapes

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
	"testing"
)

func TestAllShapeDistTraveledValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetShapeFloat64ValidOptions()
	invalidOptions := test_helpers.GetShapeFloat64InvalidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("shape_dist_traveled") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			var shapeDistTraveled *float64
			if tc.Name == "Invalid_Value" {
				shapeDistTraveled = &invalidOptions[0]
			} else if tc.Value != nil {
				shapeDistTraveled = &validOptions[tc.Row-1]
			} else {
				shapeDistTraveled = nil
			}
			validations.ShapeDistTraveledValidation(&types.Shape{ShapeDistTraveled: shapeDistTraveled}, tc.Row, &types.ShapesRules{ShapeDistTraveled: types.RuleConfig{Severity: severity}})
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
