package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"math"
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	validators "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

// ShapePointsCoordinatesDistances compares each cumulative-distance
// increment with its Haversine segment, including the first segment from zero.
// Decreases belong to the monotonic-distance rule, not this geometric check.
func ShapePointsCoordinatesDistances(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_dist_traveled", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//

		//
		// 2. Get the rule and severity

		//
		// 2. Get the severity

		severity := rowCtx.Config.Severity

		if severity == "" || severity == ruleTypes.SEVERITY_IGNORE {
			return nil
		}

		//
		// 2. Get the tolerance

		toleranceMeters := validationutils.DistanceTolerance(config, variables.DefaultShapeSegmentToleranceMeters, true)

		//
		// 3. Read this shape's sequence, coordinates, and distances from SQLite

		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 4. Read the points from the table

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 5. Parse the points

		points := []types.ShapePoint{}
		invalidSequence := false
		err = queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled"}, func(row *sqliteTypes.SQLiteRow, values map[string]string) error {
			sequence, err := strconv.Atoi(values["shape_pt_sequence"])
			if err != nil || sequence < 0 {
				invalidSequence = true
				return nil
			}
			lat, latErr := strconv.ParseFloat(values["shape_pt_lat"], 64)
			lon, lonErr := strconv.ParseFloat(values["shape_pt_lon"], 64)
			// Keep invalid values in the sequence so their neighbours are never joined.
			point := types.ShapePoint{
				ShapeID:          shapeID,
				Row:              row.Row,
				Sequence:         sequence,
				Coordinates:      types.Coordinates{Lat: lat, Lng: lon},
				ValidCoordinates: latErr == nil && lonErr == nil && validators.ValidateLatitude(lat) && validators.ValidateLongitude(lon),
			}
			if distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64); err == nil {
				point.Distance = &distance
			}
			points = append(points, point)
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

		sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
		for i := 1; i < len(points); i++ {
			if points[i].Sequence == points[i-1].Sequence {
				return nil
			}
		}

		//
		// 7. Resolve the recorded-distance unit for this shape

		var maxDistTraveled float64
		for _, point := range points {
			if geo.ValidDistance(point.Distance) && *point.Distance > maxDistTraveled {
				maxDistTraveled = *point.Distance
			}
		}
		scale := validationutils.ShapeDistanceScale(config, maxDistTraveled)

		//
		// 8. Compare each recorded increment with its geometric segment

		violations := []types.ShapeSegmentDistanceViolation{}
		for i := 1; i < len(points); i++ {
			prev, current := points[i-1], points[i]
			if !prev.ValidCoordinates || !current.ValidCoordinates ||
				!geo.ValidDistance(prev.Distance) || !geo.ValidDistance(current.Distance) {
				continue
			}
			delta := *current.Distance - *prev.Distance
			if delta < 0 {
				continue
			}
			realDistanceMeters := geo.HaversineDistance(prev.Coordinates, current.Coordinates)
			deltaMeters := delta * scale
			// Keep a micrometer allowance for floating-point cancellation at a
			// configured zero tolerance; it is not a distance reset threshold.
			if math.Abs(realDistanceMeters-deltaMeters) <= toleranceMeters+1e-6 {
				continue
			}
			violations = append(violations, types.ShapeSegmentDistanceViolation{
				ShapeID:              current.ShapeID,
				PreviousSequence:     prev.Sequence,
				CurrentSequence:      current.Sequence,
				Row:                  current.Row,
				PreviousLat:          prev.Coordinates.Lat,
				PreviousLon:          prev.Coordinates.Lng,
				CurrentLat:           current.Coordinates.Lat,
				CurrentLon:           current.Coordinates.Lng,
				RecordedDeltaMeters:  deltaMeters,
				ActualDistanceMeters: realDistanceMeters,
			})
		}

		//
		// 9. Report the violations

		for _, violation := range violations {

			validationutils.AddMessageAt(rowCtx, "shape_dist_traveled", violation.Row, context.GetTranslatedMessage(rowCtx,
				"invalid_distances",
				strconv.FormatFloat(violation.PreviousLat, 'f', -1, 64),
				strconv.FormatFloat(violation.PreviousLon, 'f', -1, 64),
				strconv.FormatFloat(violation.CurrentLat, 'f', -1, 64),
				strconv.FormatFloat(violation.CurrentLon, 'f', -1, 64),
				violation.RecordedDeltaMeters,
				violation.ActualDistanceMeters,
				violation.ShapeID,
				violation.PreviousSequence,
				violation.CurrentSequence,
				toleranceMeters,
			))
		}

		//
		// 10. Return nil

		return nil
	})
}
