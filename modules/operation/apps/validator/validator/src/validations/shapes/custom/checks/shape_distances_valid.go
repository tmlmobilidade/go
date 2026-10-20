package shapes_custom

import (
	"math"
	"sort"
	"strconv"

	"main/lib"
	"main/services"
	shapes_coordinates "main/services/geo/shapes"
	"main/types"
)

// Default tolerance between the total distance of a shape and the sum of the real
// (haversine) distances between its points, in meters.
const maxAllPointsDistanceDeltaToleranceMeters = 200.0

type shapeDistancesPoint struct {
	id           string
	row          int
	sequence     int
	lat          float64
	lon          float64
	distTraveled *float64
}

type distancesViolation struct {
	id             string
	row            int
	totalExpectedM float64 // shape_dist_traveled at end of block (meters)
	totalRealM     float64 // sum of geometric distances in block
	diffMeters     float64
}

// getDistanceToleranceMeters resolves the configurable tolerance from
// rules.Options[0] (meters), falling back to the default when rules, options
// or the value itself are missing or invalid.
func getDistanceToleranceMeters(rules *types.ShapesRules, ruleID string) float64 {
	//

	//
	// 1. Get the tolerance

	if rules == nil || rules.Rule(ruleID).Options == nil || len(*rules.Rule(ruleID).Options) == 0 {
		return maxAllPointsDistanceDeltaToleranceMeters
	}

	//
	// 2. Parse the tolerance

	value, err := strconv.ParseFloat((*rules.Rule(ruleID).Options)[0], 64)
	if err != nil || value < 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return maxAllPointsDistanceDeltaToleranceMeters
	}

	//
	// 3. Return the tolerance

	return value
}

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
func ShapeDistancesValid(db *services.SQLiteContext, rules *types.ShapesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_dist_traveled_block_valid"

	//
	// 2. Resolve the rule independently of other shape-distance checks.

	ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the tolerance

	toleranceMeters := getDistanceToleranceMeters(rules, ruleID)

	//
	// 4. Get the violations

	violations := []distancesViolation{}

	//
	// 5. Read only this shape's sequence, coordinates, and recorded distances.

	// Each point keeps its SQLite row index so sorting cannot change diagnostics.
	shapeID, err := db.Shapes.Field("shape_id")
	if err != nil {
		return err
	}
	if shapeID == "" {
		return nil
	}

	//
	// 6. Get the table

	table, err := db.Table("shapes")
	if err != nil {
		return err
	}

	//
	// 7. Get the shape groups

	shapeGroups := map[string][]shapeDistancesPoint{}
	err = table.ForEachMatching("shape_id", shapeID, func(row *services.SQLiteRow) error {
		//
		// 7.1 Get the values

		values, err := row.Fields("shape_pt_sequence", "shape_pt_lat", "shape_pt_lon", "shape_dist_traveled")
		if err != nil {
			return err
		}

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

		point := shapeDistancesPoint{id: shapeID, row: row.Row, sequence: sequence, lat: lat, lon: lon}
		if values["shape_dist_traveled"] != "" {
			distance, err := strconv.ParseFloat(values["shape_dist_traveled"], 64)
			if err != nil {
				return err
			}
			point.distTraveled = &distance
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
	// 8. Order each shape's points and compare its travelled distance with the real geometry

	for _, shapeGroup := range shapeGroups {
		sort.SliceStable(shapeGroup, func(i, j int) bool {
			return shapeGroup[i].sequence < shapeGroup[j].sequence
		})

		//
		// 8.1 Get the max distance traveled

		// GTFS doesn't fix a unit for shape_dist_traveled; feeds use either km or m.
		// The largest value in the shape is used to guess which one (see
		// shapes_coordinates.ShapeDistTraveledToMeters), since a per-segment guess
		// would be unreliable for short segments.
		var maxDistTraveled float64
		for _, pt := range shapeGroup {
			if pt.distTraveled != nil && *pt.distTraveled > maxDistTraveled {
				maxDistTraveled = *pt.distTraveled
			}
		}

		//
		// 8.2 Process blocks: from 0.0 (reset) to next 0.0 or end of shape

		for blockStart := 0; blockStart < len(shapeGroup); blockStart++ {
			pt := shapeGroup[blockStart]
			if pt.distTraveled == nil || *pt.distTraveled != 0.0 {
				continue
			}

			//
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
				if prev.distTraveled == nil || curr.distTraveled == nil {
					// An incomplete block cannot be compared end-to-end safely.
					allSegmentsPass = false
					break
				}
				// The block's first segment starts at the 0.0 reset point and must be
				// counted: the block's final shape_dist_traveled is measured from there,
				// so skipping it would leave totalRealM short by that segment's length
				// and flag correct shapes.
				if *curr.distTraveled == 0.0 {
					continue
				}

				realSegM := lib.HaversineDistance(
					types.Coordinates{Lat: prev.lat, Lng: prev.lon},
					types.Coordinates{Lat: curr.lat, Lng: curr.lon},
				)
				delta := *curr.distTraveled - *prev.distTraveled
				deltaM := shapes_coordinates.ShapeDistTraveledToMeters(delta, maxDistTraveled)

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

	//
	// 9. Report every block whose travelled distance does not match its geometry

	for _, violation := range violations {
		finding := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", ruleID, violation.row, services.AppMessageService)
		finding.WithSeverity(ctx.Severity)
		finding.AddMessageWithSeverity(finding.GetTranslatedMessage(
			"invalid_distances",
			violation.id,
			violation.totalExpectedM,
			violation.totalRealM,
			violation.diffMeters,
		))
	}

	//
	// 10. Return success

	return nil
}
