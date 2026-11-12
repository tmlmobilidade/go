package custom

import (
	"math"
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
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

Compares recorded distance totals with geometric lengths of shape blocks beginning at a recorded zero.

Validation: Groups points by non-empty shape_id and sorts them numerically by sequence. Each zero starts a block
ending before the next zero. Blocks without a following point, with missing segment distances, with an individual
distance mismatch above tolerance, or with zero accumulated geometric length are not reported. Recorded increments
below 0.001 meters, including decreases, are excluded from the geometric sum. For other segments, sums direct
Haversine distances and reports when the final recorded distance differs from that sum by more than the same
tolerance. Unreadable sequence, coordinate or populated distance text returns a read error rather than this rule's
distance finding.

Configuration: The first Options value sets a finite, non-negative tolerance in meters; the default is 200. A
shape-wide maximum recorded distance below 800 is assumed to use kilometers, otherwise meters. Unlike the segment
check, this rule does not support an explicit unit option.

Example: Small segment differences can pass individually but still accumulate into a block difference above 200
meters.

Rows with an empty shape_id are not grouped. Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [shapes.txt].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
*/
func ShapeDistancesValid(ctx *contextTypes.ValidationContext) error {

	//
	// 1. Require the shapes table before visiting each distinct shape ID.

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_dist_traveled", "shape_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Resolve the allowed difference between recorded and geometric meters.

		toleranceMeters := validationutils.DistanceTolerance(config, variables.DefaultShapeBlockToleranceMeters, true)

		//
		// 3. Collect block-distance findings for the current shape.

		violations := []types.ShapeDistanceBlockViolation{}

		//
		// 4. Read the shape ID and skip rows without one.

		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}
		if shapeID == "" {
			return nil
		}

		//
		// 5. Open the shapes table for the current group.

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 6. Read only this shape's sequences, coordinates, and recorded distances.

		shapeGroups := map[string][]types.ShapePoint{}
		err = queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled"}, func(row *sqliteTypes.SQLiteRow, values map[string]string) error {

			//
			// 7. Parse the sequence and coordinates, returning any conversion error.

			sequence, err := strconv.Atoi(values["shape_pt_sequence"])
			if err != nil {
				return err
			}
			lat, err := strconv.ParseFloat(values["shape_pt_lat"], 64)
			if err != nil {
				return err
			}
			lon, err := strconv.ParseFloat(values["shape_pt_lon"], 64)
			if err != nil {
				return err
			}

			//
			// 8. Retain the source row and parse the optional recorded distance.

			point := types.ShapePoint{ShapeID: shapeID, Row: row.Row, Sequence: sequence, Coordinates: types.Coordinates{Lat: lat, Lng: lon}}
			if values["shape_dist_traveled"] != "" {
				distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64)
				if err != nil {
					return err
				}
				point.Distance = &distance
			}

			//
			// 9. Collect the parsed point under its shape ID.

			shapeGroups[shapeID] = append(shapeGroups[shapeID], point)
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 10. Sort each shape's points by sequence before comparing its geometry.

		for _, shapeGroup := range shapeGroups {
			sort.SliceStable(shapeGroup, func(i, j int) bool {
				return shapeGroup[i].Sequence < shapeGroup[j].Sequence
			})

			//
			// 11. Use the shape's maximum recorded distance for the shared unit guess.
			// geo.ShapeDistTraveledToMeters applies this same guess to every conversion.

			var maxDistTraveled float64
			for _, pt := range shapeGroup {
				if pt.Distance != nil && *pt.Distance > maxDistTraveled {
					maxDistTraveled = *pt.Distance
				}
			}

			//
			// 12. Start a block only at a point whose recorded distance is zero.

			for blockStart := 0; blockStart < len(shapeGroup); blockStart++ {
				pt := shapeGroup[blockStart]
				if pt.Distance == nil || *pt.Distance != 0.0 {
					continue
				}

				//
				// 13. End the block before the next recorded zero, or at the final point.

				blockEnd := blockStart
				for j := blockStart + 1; j < len(shapeGroup); j++ {
					if shapeGroup[j].Distance != nil && *shapeGroup[j].Distance == 0.0 {
						break
					}
					blockEnd = j
				}

				if blockEnd <= blockStart {
					continue
				}

				//
				// 14. Accumulate Haversine lengths only for usable segments within tolerance.
				// Missing distances or a segment difference above tolerance skip this block.

				var totalRealM float64
				allSegmentsPass := true
				for j := blockStart + 1; j <= blockEnd; j++ {
					prev := shapeGroup[j-1]
					curr := shapeGroup[j]
					if prev.Distance == nil || curr.Distance == nil {
						// An incomplete block cannot be compared end-to-end safely.
						allSegmentsPass = false
						break
					}
					// Include the first segment from zero in the block's geometric total.
					if *curr.Distance == 0.0 {
						continue
					}

					realSegM := geo.HaversineDistance(
						types.Coordinates{Lat: prev.Coordinates.Lat, Lng: prev.Coordinates.Lng},
						types.Coordinates{Lat: curr.Coordinates.Lat, Lng: curr.Coordinates.Lng},
					)
					delta := *curr.Distance - *prev.Distance
					deltaM := geo.ShapeDistTraveledToMeters(delta, maxDistTraveled)

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

				//
				// 15. Skip blocks with a failed segment or no accumulated geometric length.

				if !allSegmentsPass || totalRealM == 0 {
					continue
				}

				//
				// 16. Compare the accumulated Haversine total with the block's recorded total.

				lastPt := shapeGroup[blockEnd]
				totalExpectedM := geo.ShapeDistTraveledToMeters(*lastPt.Distance, maxDistTraveled)
				diffMeters := math.Abs(totalRealM - totalExpectedM)

				if diffMeters <= toleranceMeters {
					continue
				}

				//
				// 17. Retain differences above tolerance at the block's final source row.

				violations = append(violations, types.ShapeDistanceBlockViolation{
					ShapeID:          lastPt.ShapeID,
					Row:              lastPt.Row,
					ExpectedMeters:   totalExpectedM,
					ActualMeters:     totalRealM,
					DifferenceMeters: diffMeters,
				})

				//
				// 18. Resume the outer scan after the reported block.

				blockStart = blockEnd
			}
		}

		//
		// 19. Report each block-distance finding at its retained source row.

		for _, violation := range violations {

			validationutils.AddMessageAt(rowCtx, "shape_dist_traveled", violation.Row, context.GetTranslatedMessage(rowCtx,
				"invalid_distances",
				violation.ShapeID,
				violation.ExpectedMeters,
				violation.ActualMeters,
				violation.DifferenceMeters,
			))
		}

		//
		// 20. Finish this shape after reporting its block-distance differences.

		return nil
	})
}
