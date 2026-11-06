package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
	"math"
	"sort"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	geo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

/*
ShapeDistancesValid checks, per "block" of a shape (points between one shape_dist_traveled
reset to 0.0 and the next, or the end of the shape), that the block's total shape_dist_traveled
matches the sum of the real (haversine) distances between its points. Unlike the sibling
per-segment validations, this looks at the cumulative distance over the whole block, so it can
catch drift that stays within tolerance segment-by-segment but adds up over a longer run.

A block is only checked end-to-end if every one of its individual segments already passed the
per-segment tolerance; a single bad segment skips the block's total check (it's already flagged
by the per-segment validation instead of being double-reported here).

https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeDistancesValid(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "shapes")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "shapes", "shape_id", []string{"shape_dist_traveled", "shape_id"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Get the tolerance

		toleranceMeters := validationutils.DistanceTolerance(config, variables.DefaultShapeBlockToleranceMeters, true)

		//
		// 3. Get the violations

		violations := []types.ShapeDistanceBlockViolation{}

		//
		// 4. Read only this shape's sequence, coordinates, and recorded distances.

		// Each point keeps its SQLite row index so sorting cannot change diagnostics.
		shapeID, err := queries.Field(rowCtx.Source, "shape_id")
		if err != nil {
			return err
		}
		if shapeID == "" {
			return nil
		}

		//
		// 5. Get the table

		table, err := validationutils.Table(rowCtx, "shapes")
		if err != nil {
			return err
		}

		//
		// 6. Get the shape groups

		shapeGroups := map[string][]types.ShapePoint{}
		err = queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled"}, func(row *sqliteTypes.SQLiteRow, values map[string]string) error {

			//
			// 7.2 Parse the values

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
			// 7.3 Create the point

			point := types.ShapePoint{ShapeID: shapeID, Row: row.Row, Sequence: sequence, Coordinates: types.Coordinates{Lat: lat, Lng: lon}}
			if values["shape_dist_traveled"] != "" {
				distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64)
				if err != nil {
					return err
				}
				point.Distance = &distance
			}

			//
			// 7.4 Add the point to the shape groups

			shapeGroups[shapeID] = append(shapeGroups[shapeID], point)
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 7. Order each shape's points and compare its travelled distance with the real geometry

		for _, shapeGroup := range shapeGroups {
			sort.SliceStable(shapeGroup, func(i, j int) bool {
				return shapeGroup[i].Sequence < shapeGroup[j].Sequence
			})

			//
			// 8.1 Get the max distance traveled

			// GTFS doesn't fix a unit for shape_dist_traveled; feeds use either km or m.
			// The largest value in the shape is used to guess which one (see
			// geo.ShapeDistTraveledToMeters), since a per-segment guess
			// would be unreliable for short segments.
			var maxDistTraveled float64
			for _, pt := range shapeGroup {
				if pt.Distance != nil && *pt.Distance > maxDistTraveled {
					maxDistTraveled = *pt.Distance
				}
			}

			//
			// 8.2 Process blocks: from 0.0 (reset) to next 0.0 or end of shape

			for blockStart := 0; blockStart < len(shapeGroup); blockStart++ {
				pt := shapeGroup[blockStart]
				if pt.Distance == nil || *pt.Distance != 0.0 {
					continue
				}

				//
				// Find block end: last point before next 0.0 or end of shape

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
				// Walk the block segment by segment

				// Walk the block segment by segment first: if any single segment is already
				// outside tolerance, it's the per-segment validation's job to report it, so this
				// block is skipped here rather than double-reported against its cumulative total.

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
					// The block's first segment starts at the 0.0 reset point and must be
					// counted: the block's final shape_dist_traveled is measured from there,
					// so skipping it would leave totalRealM short by that segment's length
					// and flag correct shapes.
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

				// totalRealM == 0 means every segment in the block was skipped (missing or
				// near-zero deltas), so there's nothing real to compare the block's total against.
				if !allSegmentsPass || totalRealM == 0 {
					continue
				}

				// All segments passed individually; now compare the block's cumulative real
				// distance against its final shape_dist_traveled value.
				lastPt := shapeGroup[blockEnd]
				totalExpectedM := geo.ShapeDistTraveledToMeters(*lastPt.Distance, maxDistTraveled)
				diffMeters := math.Abs(totalRealM - totalExpectedM)

				if diffMeters <= toleranceMeters {
					continue
				}

				violations = append(violations, types.ShapeDistanceBlockViolation{
					ShapeID:          lastPt.ShapeID,
					Row:              lastPt.Row,
					ExpectedMeters:   totalExpectedM,
					ActualMeters:     totalRealM,
					DifferenceMeters: diffMeters,
				})

				// Skip to after this block for next iteration
				blockStart = blockEnd
			}
		}

		//
		// 8. Report every block whose travelled distance does not match its geometry

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
		// 9. Return success

		return nil
	})
}
