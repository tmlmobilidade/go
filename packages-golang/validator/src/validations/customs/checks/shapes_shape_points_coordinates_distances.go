package custom

import (
	"math"
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
  - Field: [shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon, shape_dist_traveled]
  - Presence: Required, Required, Required, Required, Optional
  - Type: ID, Non-negative integer, Latitude, Longitude, Non-negative float

# Description

Compares each recorded distance increment with the direct geometric distance between consecutive shape points.

Validation: Groups points by non-empty shape_id and sorts them numerically by sequence. An unreadable, negative or
repeated sequence skips the entire shape. An adjacent pair is skipped when its coordinates are unreadable or out of
range, its distances are missing, negative or non-finite, or the recorded increment decreases. Other pairs are
reported when the absolute difference between the Haversine distance and the converted increment exceeds tolerance
plus 0.000001 meters. Zero increments are compared normally. Findings identify the later point.

Configuration: The first Options value sets a finite, non-negative tolerance in meters; the default is 20. The
second option can select m or km, ignoring letter case and surrounding whitespace. Without a recognized unit, a
shape-wide maximum recorded distance below 800 is assumed to use kilometers, otherwise meters.

Example: With the default kilometer assumption, an increment of 0.1111949 matches an approximately 111-meter
segment; an increment of 0.5 does not.

Rows with an empty shape_id are not grouped. Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [shapes.txt].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func ShapePointsCoordinatesDistances(ctx *contextTypes.ValidationContext) error {

	//
	// 1. Require the shapes table before visiting each distinct shape ID.

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_dist_traveled", "shape_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Skip shapes when the rule has no active severity.

		severity := rowCtx.Config.Severity

		if severity == "" || severity == ruleTypes.SEVERITY_IGNORE {
			return nil
		}

		//
		// 3. Resolve the allowed difference between recorded and geometric meters.

		toleranceMeters := validationutils.DistanceTolerance(config, variables.DefaultShapeSegmentToleranceMeters, true)

		//
		// 4. Read the current shape ID for its coordinate and distance lookup.

		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}

		//
		// 5. Open the shapes table for the current group.

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 6. Parse sequences, coordinates, and optional distances; retain source rows.

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
		// 7. Sort by sequence and skip the shape if two points share a sequence.

		sort.SliceStable(points, func(i, j int) bool { return points[i].Sequence < points[j].Sequence })
		for i := 1; i < len(points); i++ {
			if points[i].Sequence == points[i-1].Sequence {
				return nil
			}
		}

		//
		// 8. Use valid recorded distances to resolve one meter scale for the whole shape.

		var maxDistTraveled float64
		for _, point := range points {
			if geo.ValidDistance(point.Distance) && *point.Distance > maxDistTraveled {
				maxDistTraveled = *point.Distance
			}
		}
		scale := validationutils.ShapeDistanceScale(config, maxDistTraveled)

		//
		// 9. Compare each usable recorded increment with geo.HaversineDistance.

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
		// 10. Report differences above tolerance at the later point's original row.

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
		// 11. Finish this shape after reporting its segment-distance differences.

		return nil
	})
}
