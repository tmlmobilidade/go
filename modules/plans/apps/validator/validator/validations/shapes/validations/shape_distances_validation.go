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

type shapeDistancesPoint struct {
	id           string
	row          int
	sequence     int
	lat          float64
	lon          float64
	distTraveled *float64
}

const maxAllPointsDistanceDeltaToleranceMeters = 20.0

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

type distancesViolation struct {
	id             string
	row            int
	totalExpectedM float64 // shape_dist_traveled at end of block (meters)
	totalRealM     float64 // sum of geometric distances in block
	diffMeters     float64
}

// ShapeDistancesValidation validates total distance per block (from 0.0 reset to next 0.0 or end).
// First checks each segment passes tolerance; if all pass, compares total real distance to expected shape_dist_traveled.
func ShapeDistancesValidation(shapes []types.Shape, rules *types.ShapesRules) {
	severity := types.SEVERITY_ERROR
	if rules != nil && rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Severity != "" {
		severity = types.Severity(rules.ShapeDistTraveledDeltaMismatchesHaversineBlock.Severity)
	}

	shapeGroups := map[string][]shapeDistancesPoint{}
	toleranceMeters := getDistanceToleranceMeters(rules)
	violations := []distancesViolation{}

	for i, shape := range shapes {

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

	for _, shapeGroup := range shapeGroups {
		sort.Slice(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

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

			// Check each segment one-by-one with tolerance from tml-rules.json (shape_dist_tolerance)
			var totalRealM float64
			allSegmentsPass := true
			for j := blockStart + 1; j <= blockEnd; j++ {
				prev := shapeGroup[j-1]
				curr := shapeGroup[j]
				if prev.distTraveled == nil || curr.distTraveled == nil {
					continue
				}
				if *prev.distTraveled == 0.0 || *curr.distTraveled == 0.0 {
					continue
				}

				realSegM := lib.HaversineDistance(
					types.Coordinates{Lat: prev.lat, Lng: prev.lon},
					types.Coordinates{Lat: curr.lat, Lng: curr.lon},
				)
				delta := *curr.distTraveled - *prev.distTraveled
				deltaM := shapes_coordinates.ShapeDistTraveledToMeters(delta, maxDistTraveled)

				if deltaM < 0.001 {
					continue
				}
				if math.Abs(realSegM-deltaM) > toleranceMeters {
					allSegmentsPass = false
					break
				}
				totalRealM += realSegM
			}

			if !allSegmentsPass || totalRealM == 0 {
				continue
			}

			// Check final total with shapeToleranceMeters
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
