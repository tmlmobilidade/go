package shapes

import (
	"fmt"
	"main/config"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	registry "main/validations"
	shapes_custom "main/validations/shapes/custom/checks"
	shapes_standard "main/validations/shapes/standard/checks"
	validations "main/validations/shapes/validations"
)

func init() {
	registry.RegisterWithTables("shapes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	var section *types.ShapesRules
	if rules != nil {
		section = &rules.Shapes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("shapes")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	sequenceRows := map[string]*services.SQLiteContext{}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "shapes.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	groupStatuses := map[string]map[string]ruleset.Status{}
	lib.AppLogger.Debug("Running Shapes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "shapes", config.ProgressThresholdLarge)
	var allShapes []types.Shape

	var shapesRules *types.ShapesRules
	if rules != nil {
		shapesRules = &rules.Shapes
	}

	err = gtfs.IterateShapes(func(row int, rawShape types.ShapeRaw) error {
		tracker.Track()
		db := table.At(row).Context()
		shapeID, err := db.Shapes.Field("shape_id")
		if err != nil {
			return err
		}
		if shapeID != "" {
			if _, ok := sequenceRows[shapeID]; !ok {
				sequenceRows[shapeID] = db
			}
		}
		presenceStatuses := runner.Run(services.RuleActions{
			"shape_id_and_point_sequence_required": func() {
				check(db, "shape_id_and_point_sequence_required", shapes_standard.ShapeIdAndPointSequenceRequired(db, shapesRules))
			},
		}, nil)
		if shapeID != "" {
			groupStatuses[shapeID] = services.MergeRuleStatuses(groupStatuses[shapeID], presenceStatuses)
		}

		shape := validations.ParseShape(rawShape, row)

		if shape == (types.Shape{}) {
			return nil
		}

		// Validate shape_id
		statuses := runner.Run(services.RuleActions{
			"shape_id_required":                           func() { validations.ShapeIdValidation(&shape, row, shapesRules) },
			"shape_pt_lat_valid_latitude":                 func() { validations.ShapePtLatValidation(&shape, row, shapesRules) },
			"shape_pt_lon_valid_longitude":                func() { validations.ShapePtLonValidation(&shape, row, shapesRules) },
			"shape_pt_sequence_not_repeated_within_shape": func() { validations.ShapePtSequenceValidation(&shape, row, shapesRules) },
			"shape_dist_traveled_non_negative_monotonic":  func() { validations.ShapeDistTraveledValidation(&shape, row, shapesRules) },
		}, nil)

		if shape.ShapeId != nil {
			groupStatuses[*shape.ShapeId] = services.MergeRuleStatuses(groupStatuses[*shape.ShapeId], statuses)
		}

		// Add shape to all shapes
		allShapes = append(allShapes, shape)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating shapes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed shapes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

	shapeGroups := map[string][]types.Shape{}
	for _, shape := range allShapes {
		if shape.ShapeId != nil {
			shapeGroups[*shape.ShapeId] = append(shapeGroups[*shape.ShapeId], shape)
		}
	}
	for shapeID, db := range sequenceRows {
		points := shapeGroups[shapeID]
		runner.Run(services.RuleActions{
			"shape_pt_sequence_strictly_increasing": func() {
				check(db, "shape_pt_sequence_strictly_increasing", shapes_standard.ShapePtSequenceStrictlyIncreasing(db, shapesRules))
			},
			"shape_dist_traveled_non_decreasing_with_sequence": func() {
				check(db, "shape_dist_traveled_non_decreasing_with_sequence", shapes_standard.ShapeDistTraveledNonDecreasing(db, shapesRules))
			},
			"shape_sequence_position_mismatches_cumulative_traveled_distance": func() {
				check(db, "shape_sequence_position_mismatches_cumulative_traveled_distance", shapes_custom.ShapePointsCoordinatesConsistent(db, shapesRules))
			},
			"shape_dist_traveled_delta_mismatches_haversine_segment":          func() { validations.ShapePointsCoordinatesDistancesValidation(points, shapesRules) },
			"shapes_shape_dist_traveled_block_valid": func() {
				check(db, "shapes_shape_dist_traveled_block_valid", shapes_custom.ShapeDistancesValid(db, shapesRules))
			},
		}, groupStatuses[shapeID])
	}
}
