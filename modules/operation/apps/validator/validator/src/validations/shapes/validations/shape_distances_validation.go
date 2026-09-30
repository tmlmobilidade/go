package shapes

import (
	"math"
	"sort"
	"strconv"

	"main/lib"
	"main/services"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
)

// Default tolerance between the total distance of a shape and the sum of the real
// (haversine) distances between its points, in meters.
const maxAllPointsDistanceDeltaToleranceMeters = 20.0

type shapeDistancesPoint struct {
	id           string
	row          int
	sequence     int
	lat          float64
	lon          float64
	distTraveled *float64
}

type distancesViolation struct {
	id             string
	row            int
	totalExpectedM float64 // shape_dist_traveled at end of block (meters)
	totalRealM     float64 // sum of geometric distances in block
	diffMeters     float64
}

// getDistanceToleranceMeters resolves the configurable tolerance from
// rules.Options[0] (meters), falling back to the default when rules, options
// or the value itself are missing or invalid.
func getDistanceToleranceMeters(rules *types.ShapesRules) float64 {
	if rules == nil || rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Options == nil || len(*rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Options) == 0 {
		return maxAllPointsDistanceDeltaToleranceMeters
	}

	value, err := strconv.ParseFloat((*rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Options)[0], 64)
	if err != nil || value < 0 {
		return maxAllPointsDistanceDeltaToleranceMeters
	}

	return value
}

/*
ShapeDistancesValidation checks, per "block" of a shape (points between one shape_dist_traveled
reset to 0.0 and the next, or the end of the shape), that the block's total shape_dist_traveled
matches the sum of the real (haversine) distances between its points. Unlike the sibling
per-segment validations, this looks at the cumulative distance over the whole block, so it can
catch drift that stays within tolerance segment-by-segment but adds up over a longer run.

A block is only checked end-to-end if every one of its individual segments already passed the
per-segment tolerance; a single bad segment skips the block's total check (it's already flagged
by the per-segment validation instead of being double-reported here).

https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeDistancesValidation(shapes []types.Shape, rules *types.ShapesRules) {
	// Severity comes from rules; with no rules configured it defaults to SEVERITY_IGNORE,
	// so nothing below actually gets reported.
	severity := types.SEVERITY_IGNORE
	if rules != nil && rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Severity != "" {
		severity = types.Severity(rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Severity)
	}

	shapeGroups := map[string][]shapeDistancesPoint{}
	toleranceMeters := getDistanceToleranceMeters(rules)
	violations := []distancesViolation{}

	// 1. Group by shape_id the points that carry a sequence and coordinates
	for i, shape := range shapes {
		if shape.Row != nil {
			i = *shape.Row
		}

		if shape.ShapeId == nil || *shape.ShapeId == "" {
			continue
		}
		if shape.ShapePtSequence == nil || shape.ShapePtLat == nil || shape.ShapePtLon == nil {
			continue
		}

		shapeGroups[*shape.ShapeId] = append(shapeGroups[*shape.ShapeId], shapeDistancesPoint{
			id:           *shape.ShapeId,
			row:          i,
			sequence:     *shape.ShapePtSequence,
			lat:          float64(*shape.ShapePtLat),
			lon:          float64(*shape.ShapePtLon),
			distTraveled: shape.ShapeDistTraveled,
		})
	}

	// 2. Order each shape's points and compare its travelled distance with the real geometry
	for _, shapeGroup := range shapeGroups {
		sort.Slice(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

		// GTFS doesn't fix a unit for shape_dist_traveled; feeds use either km or m.
		// The largest value in the shape is used to guess which one (see
		// shapes_coordinates.ShapeDistTraveledToMeters), since a per-segment guess
		// would be unreliable for short segments.
		var maxDistTraveled float64
		for _, pt := range shapeGroup {
			if pt.distTraveled != nil && *pt.distTraveled > maxDistTraveled {
				maxDistTraveled = *pt.distTraveled
			}
		}

		// Process blocks: from 0.0 (reset) to next 0.0 or end of shape
		for blockStart := 0; blockStart < len(shapeGroup); blockStart++ {
			pt := shapeGroup[blockStart]
			if pt.distTraveled == nil || *pt.distTraveled != 0.0 {
				continue
			}

			// Find block end: last point before next 0.0 or end of shape
			blockEnd := blockStart
			for j := blockStart + 1; j < len(shapeGroup); j++ {
				if shapeGroup[j].distTraveled != nil && *shapeGroup[j].distTraveled == 0.0 {
					break
				}
				blockEnd = j
			}

			if blockEnd <= blockStart {
				continue
			}

			// Walk the block segment by segment first: if any single segment is already
			// outside tolerance, it's the per-segment validation's job to report it, so this
			// block is skipped here rather than double-reported against its cumulative total.
			var totalRealM float64
			allSegmentsPass := true
			for j := blockStart + 1; j <= blockEnd; j++ {
				prev := shapeGroup[j-1]
				curr := shapeGroup[j]
				if prev.distTraveled == nil || curr.distTraveled == nil {
					continue
				}
				// The block's first segment starts at the 0.0 reset point and must be
				// counted: the block's final shape_dist_traveled is measured from there,
				// so skipping it would leave totalRealM short by that segment's length
				// and flag correct shapes.
				if *curr.distTraveled == 0.0 {
					continue
				}

				realSegM := lib.HaversineDistance(
					types.Coordinates{Lat: prev.lat, Lng: prev.lon},
					types.Coordinates{Lat: curr.lat, Lng: curr.lon},
				)
				delta := *curr.distTraveled - *prev.distTraveled
				deltaM := shapes_coordinates.ShapeDistTraveledToMeters(delta, maxDistTraveled)

				// A near-zero delta (e.g. a duplicated shape_dist_traveled value) isn't a
				// meaningful segment to add to the block's real total.
				if deltaM < 0.001 {
					continue
				}
				if math.Abs(realSegM-deltaM) > toleranceMeters {
					allSegmentsPass = false
					break
				}
				totalRealM += realSegM
			}

			// totalRealM == 0 means every segment in the block was skipped (missing or
			// near-zero deltas), so there's nothing real to compare the block's total against.
			if !allSegmentsPass || totalRealM == 0 {
				continue
			}

			// All segments passed individually; now compare the block's cumulative real
			// distance against its final shape_dist_traveled value.
			lastPt := shapeGroup[blockEnd]
			totalExpectedM := shapes_coordinates.ShapeDistTraveledToMeters(*lastPt.distTraveled, maxDistTraveled)
			diffMeters := math.Abs(totalRealM - totalExpectedM)

			if diffMeters <= toleranceMeters {
				continue
			}

			violations = append(violations, distancesViolation{
				id:             lastPt.id,
				row:            lastPt.row,
				totalExpectedM: totalExpectedM,
				totalRealM:     totalRealM,
				diffMeters:     diffMeters,
			})

			// Skip to after this block for next iteration
			blockStart = blockEnd
		}
	}

	// 3. Report every block whose travelled distance does not match its geometry
	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_delta_mismatches_haversine_block", violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"shape_distances_validation.invalid_distances",
			violation.id,
			violation.totalExpectedM,
			violation.totalRealM,
			violation.diffMeters,
		))
	}
}
