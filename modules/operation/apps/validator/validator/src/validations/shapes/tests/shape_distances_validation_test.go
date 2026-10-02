package shapes

import (
	"testing"

	"main/lib"
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
)

// blockCoordinates are four points along a meridian, roughly 111m apart from each other.
var blockCoordinates = []types.Coordinates{
	{Lat: 38.000, Lng: -9.000},
	{Lat: 38.001, Lng: -9.000},
	{Lat: 38.002, Lng: -9.000},
	{Lat: 38.003, Lng: -9.000},
}

// blockSegmentMeters returns the real haversine length of each consecutive segment.
func blockSegmentMeters() []float64 {
	segments := make([]float64, len(blockCoordinates)-1)
	for i := 1; i < len(blockCoordinates); i++ {
		segments[i-1] = lib.HaversineDistance(blockCoordinates[i-1], blockCoordinates[i])
	}
	return segments
}

// singleBlockShapes builds one shape_id whose points form a single block: the first point
// resets shape_dist_traveled to 0.0 and every later point accumulates its real segment
// length plus offsetPerSegmentM meters of recorded drift.
//
// With a per-segment offset under tolerance but several segments, the drift stays invisible
// segment by segment while the block total ends up off by offsetPerSegmentM × segments, which
// is exactly what this validation exists to catch.
//
// Values stay under the 800 (km-vs-m) unit-detection threshold, so shape_dist_traveled is
// consistently read as kilometers.
func singleBlockShapes(offsetPerSegmentM float64) []types.Shape {
	segments := blockSegmentMeters()
	shapes := make([]types.Shape, 0, len(blockCoordinates))

	cumulativeKm := 0.0
	for i, coordinate := range blockCoordinates {
		if i > 0 {
			cumulativeKm += (segments[i-1] + offsetPerSegmentM) / 1000
		}
		shapes = append(shapes, types.Shape{
			ShapeId:           lib.Ptr("S1"),
			ShapePtSequence:   lib.Ptr(i + 1),
			ShapePtLat:        lib.Ptr(coordinate.Lat),
			ShapePtLon:        lib.Ptr(coordinate.Lng),
			ShapeDistTraveled: lib.Ptr(cumulativeKm),
		})
	}
	return shapes
}

func TestShapeDistancesValidation(t *testing.T) {
	rules := &types.ShapesRules{
		ShapeDistTraveledDeltaMismatchesHaversineBlock: types.RuleConfig{Severity: types.SEVERITY_ERROR},
	}

	t.Run("block total matches geometry: no violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapeDistancesValidation(singleBlockShapes(0), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "block total matches", types.SEVERITY_ERROR)
	})

	t.Run("per-segment drift under tolerance accumulates into a block violation", func(t *testing.T) {
		services.AppMessageService.Clear()

		// 15m of drift per segment is inside the 20m tolerance segment by segment,
		// but the three segments add up to 45m over the block.
		validations.ShapeDistancesValidation(singleBlockShapes(15), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "accumulated drift", types.SEVERITY_ERROR)
	})

	t.Run("drift that stays under tolerance in total is not reported", func(t *testing.T) {
		services.AppMessageService.Clear()

		// 5m per segment over three segments is 15m in total, inside the 20m tolerance.
		validations.ShapeDistancesValidation(singleBlockShapes(5), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "drift within tolerance", types.SEVERITY_ERROR)
	})

	t.Run("a single segment beyond tolerance skips the block's total check", func(t *testing.T) {
		services.AppMessageService.Clear()

		// One badly wrong segment is the per-segment validation's job to report, so this
		// block is left alone here rather than being double-reported on its total.
		shapes := singleBlockShapes(0)
		shapes[2].ShapeDistTraveled = lib.Ptr(*shapes[2].ShapeDistTraveled + 0.5)
		shapes[3].ShapeDistTraveled = lib.Ptr(*shapes[3].ShapeDistTraveled + 0.5)

		validations.ShapeDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "bad segment skips block", types.SEVERITY_ERROR)
	})

	t.Run("configured tolerance absorbs the accumulated drift", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapeDistancesValidation(singleBlockShapes(15), &types.ShapesRules{
			ShapeDistTraveledDeltaMismatchesHaversineBlock: types.RuleConfig{
				Severity: types.SEVERITY_ERROR,
				Options:  lib.Ptr([]string{"100"}),
			},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "configured tolerance", types.SEVERITY_ERROR)
	})

	t.Run("severity is reported as configured", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapeDistancesValidation(singleBlockShapes(15), &types.ShapesRules{
			ShapeDistTraveledDeltaMismatchesHaversineBlock: types.RuleConfig{Severity: types.SEVERITY_WARNING},
		})

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "warning severity", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 1, "warning severity", types.SEVERITY_WARNING)
	})

	t.Run("no rules configured: severity defaults to ignore, nothing reported", func(t *testing.T) {
		services.AppMessageService.Clear()

		validations.ShapeDistancesValidation(singleBlockShapes(15), nil)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no rules", types.SEVERITY_ERROR)
		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no rules", types.SEVERITY_WARNING)
	})

	t.Run("a shape without a 0.0 reset has no block to check", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := singleBlockShapes(15)
		// Shift every value so the shape never starts a block.
		for i := range shapes {
			shapes[i].ShapeDistTraveled = lib.Ptr(*shapes[i].ShapeDistTraveled + 1.0)
		}

		validations.ShapeDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no reset point", types.SEVERITY_ERROR)
	})

	t.Run("a block of a single point is skipped", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := []types.Shape{
			{ShapeId: lib.Ptr("S1"), ShapePtSequence: lib.Ptr(1), ShapePtLat: lib.Ptr(38.0), ShapePtLon: lib.Ptr(-9.0), ShapeDistTraveled: lib.Ptr(0.0)},
		}

		validations.ShapeDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "single point block", types.SEVERITY_ERROR)
	})

	t.Run("each block between resets is checked on its own", func(t *testing.T) {
		services.AppMessageService.Clear()

		// Two blocks back to back, the second restarting at 0.0. Both drift past the
		// block tolerance while staying under it segment by segment, and they drift by
		// different amounts so each one reports its own distinct message.
		first := singleBlockShapes(15)
		second := singleBlockShapes(18)
		for i := range second {
			second[i].ShapePtSequence = lib.Ptr(len(first) + i + 1)
			second[i].ShapePtLat = lib.Ptr(*second[i].ShapePtLat + 1.0)
		}

		validations.ShapeDistancesValidation(append(first, second...), rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 2, "two blocks", types.SEVERITY_ERROR)
	})

	t.Run("points of different shapes are never mixed into one block", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := singleBlockShapes(0)
		// Re-label the tail as another shape: neither shape then has enough points
		// after its own 0.0 reset to form a checkable block.
		shapes[2].ShapeId = lib.Ptr("S2")
		shapes[3].ShapeId = lib.Ptr("S2")

		validations.ShapeDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "different shapes", types.SEVERITY_ERROR)
	})

	t.Run("points without coordinates are ignored", func(t *testing.T) {
		services.AppMessageService.Clear()

		shapes := singleBlockShapes(15)
		for i := range shapes {
			shapes[i].ShapePtLon = nil
		}

		validations.ShapeDistancesValidation(shapes, rules)

		test_helpers.AssertMessageCount(t, services.AppMessageService, 0, "no coordinates", types.SEVERITY_ERROR)
	})
}
