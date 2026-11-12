package custom

import (
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: [shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon]
  - Presence: Required
  - Type: ID, Non-negative integer, Latitude, Longitude

# Description

Limits the direct geographic spacing between consecutive points of each shape.

Validation: Groups points by non-empty shape_id and sorts them numerically by sequence. An unreadable, negative or
repeated sequence skips the entire shape. Adjacent pairs with unreadable or out-of-range coordinates are skipped
without bridging across the invalid point. Reports a pair only when its Haversine distance is strictly greater than
the limit, at the later point. Equality passes; recorded shape_dist_traveled values are not used.

Configuration: The first Options value sets a finite, positive maximum distance in meters; the default is 1000.
Zero, negative, non-finite or unreadable options restore the default.

Rows with an empty shape_id are not grouped. Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [shapes.txt].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func ShapePointsCoordinatesConsistent(ctx *contextTypes.ValidationContext) error {

	//
	// 1. Require the shapes table before visiting each distinct shape ID.

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_pt_sequence", "shape_id"}, func(rowCtx *contextTypes.ValidationContext) error {
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
