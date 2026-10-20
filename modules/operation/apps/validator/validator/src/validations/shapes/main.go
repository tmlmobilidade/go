package shapes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	shapes_custom "main/validations/shapes/custom/checks"
	shapes_fields "main/validations/shapes/fields/checks"
	shapes_standard "main/validations/shapes/standard/checks"
)

func init() {
	registry.RegisterWithTables("shapes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	var fileRules *types.ShapesRules
	if rules != nil {
		fileRules = &rules.Shapes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, fileRules)
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
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "shapes.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running Shapes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "shapes", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "shape", "shape_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			//
			// Fields
			"shapes_shape_id_field":            func() { check(db, "shapes_shape_id_field", shapes_fields.ShapeIdField(db, fileRules)) },
			"shapes_shape_pt_lat_field":        func() { check(db, "shapes_shape_pt_lat_field", shapes_fields.ShapePtLatField(db, fileRules)) },
			"shapes_shape_pt_lon_field":        func() { check(db, "shapes_shape_pt_lon_field", shapes_fields.ShapePtLonField(db, fileRules)) },
			"shapes_shape_pt_sequence_field":   func() { check(db, "shapes_shape_pt_sequence_field", shapes_fields.ShapePtSequenceField(db, fileRules)) },
			"shapes_shape_dist_traveled_field": func() { check(db, "shapes_shape_dist_traveled_field", shapes_fields.ShapeDistTraveledField(db, fileRules)) },

			//
			// Standard
			"shapes_shape_pt_lat_valid":                        func() { check(db, "shapes_shape_pt_lat_valid", shapes_standard.ShapePtLatValid(db, fileRules)) },
			"shapes_shape_pt_lon_valid":                        func() { check(db, "shapes_shape_pt_lon_valid", shapes_standard.ShapePtLonValid(db, fileRules)) },
			"shapes_shape_pt_sequence_non_negative":            func() { check(db, "shapes_shape_pt_sequence_non_negative", shapes_standard.ShapePtSequence(db, fileRules)) },
			"shapes_shape_dist_traveled_valid":                 func() { check(db, "shapes_shape_dist_traveled_valid", shapes_standard.ShapeDistTraveledValid(db, fileRules)) },
			"shape_pt_sequence_strictly_increasing":            func() { check(db, "shape_pt_sequence_strictly_increasing", shapes_standard.ShapePtSequenceStrictlyIncreasing(db, fileRules)) },
			"shape_dist_traveled_non_decreasing_with_sequence": func() { check(db, "shape_dist_traveled_non_decreasing_with_sequence", shapes_standard.ShapeDistTraveledNonDecreasing(db, fileRules)) },

			//
			// Custom
			"shapes_shape_point_spacing_valid":         func() { check(db, "shapes_shape_point_spacing_valid", shapes_custom.ShapePointsCoordinatesConsistent(db, fileRules)) },
			"shapes_shape_dist_traveled_segment_valid": func() { check(db, "shapes_shape_dist_traveled_segment_valid", shapes_custom.ShapePointsCoordinatesDistances(db, fileRules)) },
			"shapes_shape_dist_traveled_block_valid":   func() { check(db, "shapes_shape_dist_traveled_block_valid", shapes_custom.ShapeDistancesValid(db, fileRules)) },
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating shapes: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed shapes.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
