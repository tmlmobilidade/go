package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
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

// ShapePointsCoordinatesConsistent checks consecutive coordinate gaps,
// independent of shape_dist_traveled.
func ShapePointsCoordinatesConsistent(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_pt_sequence", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//

		//
		// 2. Get the rule and tolerance

		//
		// 2. Get the severity

		severity := rowCtx.Config.Severity
		if severity == "" || severity == ruleTypes.SEVERITY_IGNORE {
			return nil
		}

		//
		// 2. Get the tolerance

		toleranceMeters := validationutils.DistanceTolerance(config, variables.MaxShapePointDistanceMeters, false)

		//
		// 3. Read this shape's sequence and coordinates from SQLite

		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 4. Read the points from the table

		points := []types.ShapePoint{}
		invalidSequence := false
		err = queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_sequence", "shape_pt_lat", "shape_pt_lon"}, func(row *sqliteTypes.SQLiteRow, values map[string]string) error {
			sequence, err := strconv.Atoi(values["shape_pt_sequence"])
			if err != nil || sequence < 0 {
				invalidSequence = true
				return nil
			}
			lat, latErr := strconv.ParseFloat(values["shape_pt_lat"], 64)
			lon, lonErr := strconv.ParseFloat(values["shape_pt_lon"], 64)
			// Invalid coordinates stay in the sequence so their neighbours are never joined.
			points = append(points, types.ShapePoint{
				Row:              row.Row,
				Sequence:         sequence,
				Coordinates:      types.Coordinates{Lat: lat, Lng: lon},
				ValidCoordinates: latErr == nil && lonErr == nil && validators.ValidateLatitude(lat) && validators.ValidateLongitude(lon),
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
		// 5. Order the points, skipping shapes with ambiguous sequences

		sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
		for i := 1; i < len(points); i++ {
			if points[i].Sequence == points[i-1].Sequence {
				return nil
			}
		}

		//
		// 6. Compare consecutive coordinates

		violations := []types.ShapeSpacingViolation{}
		for i := 1; i < len(points); i++ {
			prev, current := points[i-1], points[i]
			if !prev.ValidCoordinates || !current.ValidCoordinates {
				continue
			}
			distanceMeters := geo.HaversineDistance(prev.Coordinates, current.Coordinates)
			if distanceMeters <= toleranceMeters {
				continue
			}
			violations = append(violations, types.ShapeSpacingViolation{
				ShapeID:          shapeID,
				Row:              current.Row,
				CurrentLat:       current.Coordinates.Lat,
				CurrentLon:       current.Coordinates.Lng,
				CurrentSequence:  current.Sequence,
				PreviousLat:      prev.Coordinates.Lat,
				PreviousLon:      prev.Coordinates.Lng,
				PreviousSequence: prev.Sequence,
				DistanceMeters:   distanceMeters,
			})
		}

		//
		// 7. Report the violations

		for _, violation := range violations {

			validationutils.AddMessageAt(rowCtx, "shape_pt_sequence", violation.Row, context.GetTranslatedMessage(rowCtx,
				"invalid_consistent_distance",
				violation.ShapeID,
				violation.CurrentLat,
				violation.CurrentLon,
				violation.CurrentSequence,
				violation.PreviousLat,
				violation.PreviousLon,
				violation.PreviousSequence,
				violation.DistanceMeters,
				toleranceMeters,
			))
		}

		//
		// 8. Return nil

		return nil
	})
}
