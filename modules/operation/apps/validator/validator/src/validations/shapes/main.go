package shapes

import (
	"fmt"
	"main/config"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/shapes/validations"
)

func init() {
	registry.Register("shapes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.ShapesRules
	if rules != nil {
		section = &rules.Shapes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
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

	err := gtfs.IterateShapes(func(row int, rawShape types.ShapeRaw) error {
		tracker.Track()
		shape := validations.ParseShape(rawShape, row)

		if shape == (types.Shape{}) {
			return nil
		}

		// Validate shape_id
		statuses := runner.Run(services.RuleActions{
			"shape_id_required":                           func() { validations.ShapeIdValidation(&shape, row) },
			"shape_pt_lat_valid_latitude":                 func() { validations.ShapePtLatValidation(&shape, row) },
			"shape_pt_lon_valid_longitude":                func() { validations.ShapePtLonValidation(&shape, row) },
			"shape_pt_sequence_not_repeated_within_shape": func() { validations.ShapePtSequenceValidation(&shape, row) },
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
	for shapeID, points := range shapeGroups {
		runner.Run(services.RuleActions{
			"shape_id_and_point_sequence_required":                            func() {
				validations.ShapeSequenceRuleValidation(points, shapesRules, "shape_id_and_point_sequence_required")
			},
			"shape_pt_sequence_strictly_increasing":                           func() {
				validations.ShapeSequenceRuleValidation(points, shapesRules, "shape_pt_sequence_strictly_increasing")
			},
			"shape_dist_traveled_non_decreasing_with_sequence":                func() {
				validations.ShapeSequenceRuleValidation(points, shapesRules, "shape_dist_traveled_non_decreasing_with_sequence")
			},
			"shape_sequence_position_mismatches_cumulative_traveled_distance": func() { validations.ShapePointsCoordinatesConsistentValidation(points, shapesRules) },
			"shape_dist_traveled_delta_mismatches_haversine_segment":          func() { validations.ShapePointsCoordinatesDistancesValidation(points, shapesRules) },
			"shape_dist_traveled_delta_mismatches_haversine_block":            func() { validations.ShapeDistancesValidation(points, shapesRules) },
		}, groupStatuses[shapeID])
	}
}
