package shapes

import (
	"testing"

	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
)

func TestShapePointsCoordinatesConsistentValidationUsesConfiguredTolerance(t *testing.T) {
	shapes := []types.Shape{
		{
			ShapeId:         lib.Ptr("shape-a"),
			ShapePtSequence: lib.Ptr(1),
			ShapePtLat:      lib.Ptr(float32(38.0)),
			ShapePtLon:      lib.Ptr(float32(-9.0)),
		},
		{
			ShapeId:         lib.Ptr("shape-a"),
			ShapePtSequence: lib.Ptr(2),
			ShapePtLat:      lib.Ptr(float32(38.011)),
			ShapePtLon:      lib.Ptr(float32(-9.0)),
		},
	}

	t.Run("default tolerance reports violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesConsistentValidation(shapes, &types.ShapesRules{
			ShapePointsCoordinatesConsistent: types.RuleConfig{Severity: types.SEVERITY_ERROR},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "default tolerance", types.SEVERITY_ERROR)
	})

	t.Run("configured tolerance allows segment", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesConsistentValidation(shapes, &types.ShapesRules{
			ShapePointsCoordinatesConsistent: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  lib.Ptr([]string{"1500.0"}),
			},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "configured tolerance", types.SEVERITY_ERROR)
	})
}
