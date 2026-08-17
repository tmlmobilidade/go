package shapes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
	"testing"
)

func TestAllShapeSequenceValidationTestCases(t *testing.T) {
	validOptions := test_helpers.GetValidShapeOptions()
	negativeOption := -1
	for _, tc := range test_helpers.GetGenericRequiredFieldTestCases("shape_sequence") {
		if tc.Name == "Recommended_Missing" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()

			var shapes []types.Shape
			if tc.Name == "Invalid_Value" {
				shapes = []types.Shape{
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(negativeOption), ShapeDistTraveled: lib.Ptr(0.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(negativeOption), ShapeDistTraveled: lib.Ptr(1.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(negativeOption), ShapeDistTraveled: lib.Ptr(2.0)},
				}
			} else if tc.Value != nil {
				shapes = []types.Shape{
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(validOptions[0]), ShapeDistTraveled: lib.Ptr(0.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(validOptions[1]), ShapeDistTraveled: lib.Ptr(1.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: lib.Ptr(validOptions[2]), ShapeDistTraveled: lib.Ptr(2.0)},
				}
			} else {
				shapes = []types.Shape{
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: nil, ShapeDistTraveled: lib.Ptr(0.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: nil, ShapeDistTraveled: lib.Ptr(1.0)},
					{ShapeId: lib.Ptr("A_shp"), ShapePtSequence: nil, ShapeDistTraveled: lib.Ptr(2.0)},
				}
			}
			validations.ShapeSequenceValidation(shapes, nil)

			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedWarnings, tc.Name, types.SEVERITY_WARNING)
		})
	}
}
