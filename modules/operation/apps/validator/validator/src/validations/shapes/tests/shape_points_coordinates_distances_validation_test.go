package shapes

import (
	"testing"

	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
)

// shapeDistancesSegmentShapes builds one shape_id with three points along a meridian.
//
// The first segment starts at zero and matches its geometric distance. The second
// segment has a recorded shape_dist_traveled delta offset from the real haversine
// distance by offsetM meters, letting each test place the mismatch inside or outside tolerance.
//
// All values stay well under the 800 (km-vs-m) unit-detection threshold, so shape_dist_traveled
// is consistently read as kilometers.
func shapeDistancesSegmentShapes(offsetM float64) []types.Shape {
	p0 := types.Coordinates{Lat: 38.000, Lng: -9.000}
	p1 := types.Coordinates{Lat: 38.001, Lng: -9.000}
	p2 := types.Coordinates{Lat: 38.002, Lng: -9.000}

	firstSegM := lib.HaversineDistance(p0, p1)
	secondSegM := lib.HaversineDistance(p1, p2)

	return []types.Shape{
		{
			ShapeId:           lib.Ptr("S1"),
			ShapePtSequence:   lib.Ptr(1),
			ShapePtLat:        lib.Ptr(p0.Lat),
			ShapePtLon:        lib.Ptr(p0.Lng),
			ShapeDistTraveled: lib.Ptr(0.0),
		},
		{
			ShapeId:           lib.Ptr("S1"),
			ShapePtSequence:   lib.Ptr(2),
			ShapePtLat:        lib.Ptr(p1.Lat),
			ShapePtLon:        lib.Ptr(p1.Lng),
			ShapeDistTraveled: lib.Ptr(firstSegM / 1000),
		},
		{
			ShapeId:           lib.Ptr("S1"),
			ShapePtSequence:   lib.Ptr(3),
			ShapePtLat:        lib.Ptr(p2.Lat),
			ShapePtLon:        lib.Ptr(p2.Lng),
			ShapeDistTraveled: lib.Ptr((firstSegM + secondSegM + offsetM) / 1000),
		},
	}
}

func TestShapePointsCoordinatesDistancesValidation(t *testing.T) {
	rules := &types.ShapesRules{ShapePointsCoordinatesDistances: types.RuleConfig{Severity: types.SEVERITY_ERROR}}

	t.Run("delta matches real distance: no violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(0), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "matches real distance", types.SEVERITY_ERROR)
	})

	t.Run("delta beyond default tolerance: violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(100), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "beyond default tolerance", types.SEVERITY_ERROR)
	})

	t.Run("delta within default tolerance: no violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(15), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "within default tolerance", types.SEVERITY_ERROR)
	})

	t.Run("configured tolerance absorbs the same mismatch", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(100), &types.ShapesRules{
			ShapePointsCoordinatesDistances: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  lib.Ptr([]string{"150"}),
			},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "configured tolerance", types.SEVERITY_ERROR)
	})

	t.Run("severity is reported as configured", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(100), &types.ShapesRules{
			ShapePointsCoordinatesDistances: types.RuleConfig{Severity: types.SEVERITY_WARNING},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "warning severity", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "warning severity", types.SEVERITY_WARNING)
	})

	t.Run("no rules configured: severity defaults to ignore, nothing reported", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapePointsCoordinatesDistancesValidation(shapeDistancesSegmentShapes(100), nil)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no rules", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no rules", types.SEVERITY_WARNING)
	})

	t.Run("missing shape_dist_traveled on a point skips its segment", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := shapeDistancesSegmentShapes(100)
		shapes[2].ShapeDistTraveled = nil

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "missing shape_dist_traveled", types.SEVERITY_ERROR)
	})

	t.Run("decreasing distance is left to the monotonic-distance rule", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := shapeDistancesSegmentShapes(100)
		// This decrease is invalid cumulative distance, reported by a separate rule.
		shapes[2].ShapeDistTraveled = lib.Ptr(0.0)

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "reset to 0.0", types.SEVERITY_ERROR)
	})

	t.Run("zero delta with moving coordinates is a mismatch", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := shapeDistancesSegmentShapes(0)
		// Same shape_dist_traveled on both ends of the segment (a ~0m recorded delta)
		// against a real ~111m step must be reported.
		shapes[2].ShapeDistTraveled = shapes[1].ShapeDistTraveled

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "near-zero delta", types.SEVERITY_ERROR)
	})

	t.Run("points of different shapes are never compared to each other", func(t *testing.T) {
		services.AppMessageService.Clear()

		// Two far-apart points that would be a huge mismatch if they were one shape.
		shapes := []types.Shape{
			{ShapeId: lib.Ptr("S1"), ShapePtSequence: lib.Ptr(1), ShapePtLat: lib.Ptr(38.0), ShapePtLon: lib.Ptr(-9.0), ShapeDistTraveled: lib.Ptr(1.0)},
			{ShapeId: lib.Ptr("S2"), ShapePtSequence: lib.Ptr(2), ShapePtLat: lib.Ptr(41.0), ShapePtLon: lib.Ptr(-8.0), ShapeDistTraveled: lib.Ptr(1.1)},
		}

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "different shapes", types.SEVERITY_ERROR)
	})

	t.Run("points without coordinates or sequence are ignored", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := shapeDistancesSegmentShapes(100)
		shapes[2].ShapePtLat = nil

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no coordinates", types.SEVERITY_ERROR)
	})

	t.Run("more than 100 violations collapse into one message per unique row", func(t *testing.T) {
		services.AppMessageService.Clear()

		// 103 points give 102 mismatching segments, including the first from zero.
		shapes := make([]types.Shape, 0, 103)
		for i := 0; i < 103; i++ {
			shapes = append(shapes, types.Shape{
				// Force every point onto the same source row so the collapsed report
				// deduplicates down to exactly one.
				Row:             lib.Ptr(1),
				ShapeId:         lib.Ptr("S1"),
				ShapePtSequence: lib.Ptr(i + 1),
				ShapePtLat:      lib.Ptr(38.0 + float64(i)*0.001),
				ShapePtLon:      lib.Ptr(-9.0),
				// Each step records a 7km jump against a real ~111m step: a guaranteed
				// mismatch on every segment, still under the 800 unit-detection threshold.
				ShapeDistTraveled: lib.Ptr(float64(i) * 7.0),
			})
		}

		validations.ShapePointsCoordinatesDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "many violations collapsed", types.SEVERITY_ERROR)
	})
}
