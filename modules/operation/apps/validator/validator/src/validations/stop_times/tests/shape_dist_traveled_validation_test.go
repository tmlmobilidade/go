package stop_times

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/stop_times/validations"
	"testing"
)

func TestAllShapeDistTraveledValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetShapeFloat64ValidOptions()
	negativeOptions := test_helpers.GetShapeFloat64InvalidOptions()
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("shape_dist_traveled") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var shapeDistTraveled *float64
			if tc.Name == "Invalid_Value" {
				shapeDistTraveled = &negativeOptions[0]
			} else if tc.Value != nil {
				shapeDistTraveled = &validOptions[0]
			} else {
				shapeDistTraveled = nil
			}

			var severity types.Severity
			if tc.ExpectedWarnings > 0 {
				severity = types.SEVERITY_WARNING
			} else {
				severity = types.SEVERITY_ERROR
			}

			rules := &types.StopTimesRules{ShapeDistTraveled: types.RuleConfig{Severity: severity}}
			validations.ShapeDistTraveledValidation(&types.StopTime{ShapeDistTraveled: shapeDistTraveled}, tc.Row, rules)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}

}
