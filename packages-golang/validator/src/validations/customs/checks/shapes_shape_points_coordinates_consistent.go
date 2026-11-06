package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
* ShapePointsCoordinatesConsistent compares consecutive shape coordinates using
* Haversine distances in meters, independently of shape_dist_traveled.
* Invalid or duplicate sequences skip the shape. Invalid coordinates remain in
* sequence but their adjacent segments are skipped, so neighbors are never joined.
* Gaps above the configured tolerance are reported at the later point's source row.
 */
func ShapePointsCoordinatesConsistent(ctx *context.ValidationContext) error {

	//
	// 1. Require the shapes table before visiting each distinct shape ID.

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_pt_sequence", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Skip shapes when the rule has no active severity.

		severity := rowCtx.Config.Severity
		if severity == "" || severity == ruleTypes.SEVERITY_IGNORE {
			return nil
		}

		//
		// 3. Resolve the maximum allowed coordinate gap in meters.

		toleranceMeters := validationutils.DistanceTolerance(config, variables.MaxShapePointDistanceMeters, false)

		//
		// 4. Read the current shape ID and open its source table.

		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 5. Parse source rows, retaining invalid coordinates and original row indexes.

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
		// 6. Sort by sequence and skip the shape if two points share a sequence.

		sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
		for i := 1; i < len(points); i++ {
			if points[i].Sequence == points[i-1].Sequence {
				return nil
			}
		}

		//
		// 7. Use geo.HaversineDistance to measure each pair of valid adjacent points.

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
		// 8. Report gaps above tolerance at the later point's original SQLite row.

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
		// 9. Finish this shape after reporting its coordinate gaps.

		return nil
	})
}
