package shapes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/shapes/validations"
)

func init() {
	registry.Register("shapes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.ShapeIdValidation(&shape, row)

		// Validate shape_pt_lat
		validations.ShapePtLatValidation(&shape, row)

		// Validate shape_pt_lon
		validations.ShapePtLonValidation(&shape, row)

		// Validate shape_pt_sequence
		validations.ShapePtSequenceValidation(&shape, row)

		// Validate shape_dist_traveled
		validations.ShapeDistTraveledValidation(&shape, row, shapesRules)

		// Add shape to all shapes
		allShapes = append(allShapes, shape)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating shapes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed shapes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}

	// Group-level validation: shape_pt_sequence must increase for each shape_id
	validations.ShapeSequenceValidation(allShapes, shapesRules)

	// Validate shape coordinates consistency
	validations.ShapePointsCoordinatesConsistentValidation(allShapes, shapesRules)

	// Validate shape coordinates distances
	validations.ShapePointsCoordinatesDistancesValidation(allShapes, shapesRules)

	// Validate shape all points distances
	validations.ShapeDistancesValidation(allShapes, shapesRules)

}
