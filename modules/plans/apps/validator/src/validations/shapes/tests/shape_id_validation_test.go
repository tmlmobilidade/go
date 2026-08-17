package shapes

import (
	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
	"testing"
)

func TestAllShapeIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("shape_id") {
		if tc.Name == "Duplicate_Id" || tc.Name == "Valid_Unique" {
			continue
		}
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			validations.ShapeIdValidation(&types.Shape{ShapeId: tc.Id}, tc.Row)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
	t.Run("Empty_ShapeId", func(t *testing.T) {
		services.AppMessageService.Clear()
		validations.ShapeIdValidation(&types.Shape{ShapeId: lib.Ptr("")}, 2)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "Empty shape_id should error", types.SEVERITY_ERROR)
	})
}
