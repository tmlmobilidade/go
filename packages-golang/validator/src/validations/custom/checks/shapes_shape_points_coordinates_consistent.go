package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	shapes_coordinates "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo/shapes"
	"main/types"
	"math"
	"sort"
	"strconv"
)

// coordinatesConsistentPoint represents a point in a shape's sequence, with its row, sequence, coordinates, and validity.
type coordinatesConsistentPoint struct {
	row              int
	sequence         int
	coordinates      types.Coordinates
	validCoordinates bool
}

// pointsCoordinatesConsistentViolation represents a violation of the shape points coordinates consistency rule.
type pointsCoordinatesConsistentViolation struct {
	shapeId        string
	row            int
	currentLat     float64
	currentLon     float64
	currentSeq     int
	previousLat    float64
	previousLon    float64
	previousSeq    int
	distanceMeters float64
}

// getShapePointsCoordinatesConsistentToleranceMeters resolves the configurable
// tolerance from rules.Options[0] (meters), falling back to the default when
// rules, options or the value itself are missing or invalid.
func getShapePointsCoordinatesConsistentToleranceMeters(rules *types.RuleContext) float64 {
	if rules == nil || rules.Options == nil || len(*rules.Options) == 0 {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	value, err := strconv.ParseFloat((*rules.Options)[0], 64)
	if err != nil || value <= 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return shapes_coordinates.MAX_SHAPE_POINT_DISTANCE_METERS
	}

	return value
}

// uniquePointsCoordinatesConsistentRows deduplicates row numbers while preserving their
// first-seen order, so the collapsed "many errors" report emits one message per row instead
// of one per violation.
func uniquePointsCoordinatesConsistentRows(rows []int) []int {
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

// ShapePointsCoordinatesConsistent checks consecutive coordinate gaps,
// independent of shape_dist_traveled.
func ShapePointsCoordinatesConsistent(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule and tolerance

	const ruleID = "shapes_shape_point_spacing_valid"

	//
	// 2. Get the severity

	severity := types.SEVERITY_IGNORE
	if rules != nil {
		severity = rules.Severity
	}
	if severity == "" || severity == types.SEVERITY_IGNORE {
		return nil
	}

	//
	// 3. Get the tolerance

	toleranceMeters := getShapePointsCoordinatesConsistentToleranceMeters(rules)

	//
	// 4. Read this shape's sequence and coordinates from SQLite

	shapeID, err := db.Shapes.Field("shape_id")
	if err != nil {
		return err
	}

	table, err := db.Table("shapes")
	if err != nil {
		return err
	}

	//
	// 5. Read the points from the table

	points := []coordinatesConsistentPoint{}
	invalidSequence := false
	err = table.ForEachMatching("shape_id", shapeID, func(row *services.SQLiteRow) error {
		values, err := row.Fields("shape_pt_sequence", "shape_pt_lat", "shape_pt_lon")
		if err != nil {
			return err
		}
		sequence, err := strconv.Atoi(values["shape_pt_sequence"])
		if err != nil || sequence < 0 {
			invalidSequence = true
			return nil
		}
		lat, latErr := strconv.ParseFloat(values["shape_pt_lat"], 64)
		lon, lonErr := strconv.ParseFloat(values["shape_pt_lon"], 64)
		// Invalid coordinates stay in the sequence so their neighbours are never joined.
		points = append(points, coordinatesConsistentPoint{
			row:              row.Row,
			sequence:         sequence,
			coordinates:      types.Coordinates{Lat: lat, Lng: lon},
			validCoordinates: latErr == nil && lonErr == nil && lib.ValidateLatitude(lat) && lib.ValidateLongitude(lon),
		})
		return nil
	})
	if err != nil {
		return err
	}
	if invalidSequence {
		return nil
	}

	//
	// 6. Order the points, skipping shapes with ambiguous sequences

	sort.SliceStable(points, func(i, j int) bool { return points[i].sequence < points[j].sequence })
	for i := 1; i < len(points); i++ {
		if points[i].sequence == points[i-1].sequence {
			return nil
		}
	}

	//
	// 7. Compare consecutive coordinates

	violations := []pointsCoordinatesConsistentViolation{}
	for i := 1; i < len(points); i++ {
		prev, current := points[i-1], points[i]
		if !prev.validCoordinates || !current.validCoordinates {
			continue
		}
		distanceMeters := lib.HaversineDistance(prev.coordinates, current.coordinates)
		if distanceMeters <= toleranceMeters {
			continue
		}
		violations = append(violations, pointsCoordinatesConsistentViolation{
			shapeId:        shapeID,
			row:            current.row,
			currentLat:     current.coordinates.Lat,
			currentLon:     current.coordinates.Lng,
			currentSeq:     current.sequence,
			previousLat:    prev.coordinates.Lat,
			previousLon:    prev.coordinates.Lng,
			previousSeq:    prev.sequence,
			distanceMeters: distanceMeters,
		})
	}

	//
	// 8. Report the violations

	for _, violation := range violations {
		ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", ruleID, violation.row, services.AppMessageService)
		ctx.WithSeverity(severity)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage(
			"invalid_consistent_distance",
			violation.shapeId,
			violation.currentLat,
			violation.currentLon,
			violation.currentSeq,
			violation.previousLat,
			violation.previousLon,
			violation.previousSeq,
			violation.distanceMeters,
			toleranceMeters,
		))
	}

	//
	// 9. Return nil

	return nil
}
