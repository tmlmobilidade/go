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

type shapeDistancePoint struct {
	row          int
	sequence     int
	lat          float64
	lon          float64
	distTraveled *float64
}

const maxDistanceDeltaToleranceMeters = 20.0

func getShapePointsCoordinatesDistancesToleranceMeters(rules *types.ShapesRules) float64 {
	if rules == nil || rules.ShapePointsCoordinatesDistances.Options == nil || len(*rules.ShapePointsCoordinatesDistances.Options) == 0 {
		return maxDistanceDeltaToleranceMeters
	}

	value, err := strconv.ParseFloat((*rules.ShapePointsCoordinatesDistances.Options)[0], 64)
	if err != nil || value < 0 {
		return maxDistanceDeltaToleranceMeters
	}

	return value
}

type distanceViolation struct {
	row                int
	prevLat            float64
	prevLon            float64
	currentLat         float64
	currentLon         float64
	distTraveledDelta  float64 // raw value from file (km or m)
	distTraveledDeltaM float64 // converted to meters for comparison
	realDistanceMeters float64
}

func uniqueDistanceRows(rows []int) []int {
	seen := make(map[int]struct{}, len(rows))
	unique := make([]int, 0, len(rows))
	for _, row := range rows {
		if _, ok := seen[row]; ok {
			continue
		}
		seen[row] = struct{}{}
		unique = append(unique, row)
	}
	return unique
}

// ShapeCoordinatesDistancesValidation validates if the geometric distance between
// consecutive points matches the shape_dist_traveled increment.
func ShapePointsCoordinatesDistancesValidation(shapes []types.Shape, rules *types.ShapesRules) {
	severity := types.SEVERITY_ERROR
	if rules != nil && rules.ShapePointsCoordinatesDistances.Severity != "" {
		severity = types.Severity(rules.ShapePointsCoordinatesDistances.Severity)
	}

	shapeGroups := map[string][]shapeDistancePoint{}
	toleranceMeters := getShapePointsCoordinatesDistancesToleranceMeters(rules)
	violations := []distanceViolation{}

	for i, shape := range shapes {

		if shape.ShapeId == nil || *shape.ShapeId == "" {
			continue
		}
		if shape.ShapePtSequence == nil || shape.ShapePtLat == nil || shape.ShapePtLon == nil {
			continue
		}

		shapeGroups[*shape.ShapeId] = append(shapeGroups[*shape.ShapeId], shapeDistancePoint{
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

		// Max shape_dist_traveled in shape: used to detect unit (km if < 800, else m)
		var maxDistTraveled float64
		for _, pt := range shapeGroup {
			if pt.distTraveled != nil && *pt.distTraveled > maxDistTraveled {
				maxDistTraveled = *pt.distTraveled
			}
		}

		for i := 1; i < len(shapeGroup); i++ {
			prevShapePoint := shapeGroup[i-1]
			currentShapePoint := shapeGroup[i]

			if prevShapePoint.distTraveled == nil || currentShapePoint.distTraveled == nil {
				continue
			}
			// Skip when shape_dist_traveled is 0.0: first point of shape or reset when shape changes.
			if *prevShapePoint.distTraveled == 0.0 || *currentShapePoint.distTraveled == 0.0 {
				continue
			}

			realDistanceMeters := lib.HaversineDistance(
				types.Coordinates{Lat: prevShapePoint.lat, Lng: prevShapePoint.lon},
				types.Coordinates{Lat: currentShapePoint.lat, Lng: currentShapePoint.lon},
			)
			distTraveledDelta := *currentShapePoint.distTraveled - *prevShapePoint.distTraveled
			distTraveledDeltaMeters := shapes_coordinates.ShapeDistTraveledToMeters(distTraveledDelta, maxDistTraveled)

			if math.Abs(realDistanceMeters-distTraveledDeltaMeters) <= toleranceMeters {
				continue
			}

			if distTraveledDeltaMeters < 0.001 {
				continue
			}

			violations = append(violations, distanceViolation{
				row:                currentShapePoint.row,
				prevLat:            prevShapePoint.lat,
				prevLon:            prevShapePoint.lon,
				currentLat:         currentShapePoint.lat,
				currentLon:         currentShapePoint.lon,
				distTraveledDelta:  distTraveledDelta,
				distTraveledDeltaM: distTraveledDeltaMeters,
				realDistanceMeters: realDistanceMeters,
			})
		}
	}

	if len(violations) > 100 {
		rows := make([]int, 0, len(violations))
		for _, violation := range violations {
			rows = append(rows, violation.row)
		}

		for _, row := range uniqueDistanceRows(rows) {
			ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_delta_mismatches_haversine_segment", row, services.AppMessageService)
			ctx.WithSeverity(severity)
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_points_coordinates_distances_validation.ManyErrors"))
		}
		return
	}

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_delta_mismatches_haversine_segment", violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"shape_points_coordinates_distances_validation.invalid_distances",
			strconv.FormatFloat(violation.prevLat, 'f', -1, 64),
			strconv.FormatFloat(violation.prevLon, 'f', -1, 64),
			strconv.FormatFloat(violation.currentLat, 'f', -1, 64),
			strconv.FormatFloat(violation.currentLon, 'f', -1, 64),
			violation.distTraveledDeltaM,
			violation.realDistanceMeters,
		))
	}
}
