package pathways

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	pathways_fields "main/validations/pathways/fields/checks"
	pathways_standard "main/validations/pathways/standard/checks"
)

func init() { registry.RegisterWithTables("pathways", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "pathways")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "pathways", config.ProgressThresholdLarge)
	err = tables.ForEachRow("pathways", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "pathways.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"pathways_max_slope_field": func() {
				check("pathways_max_slope_field", pathways_fields.MaxSlopeField(db, rules.Rule("pathways_max_slope_field")))
			},
			"pathways_traversal_time_field": func() {
				check("pathways_traversal_time_field", pathways_fields.TraversalTimeField(db, rules.Rule("pathways_traversal_time_field")))
			},
			"pathways_to_stop_id_field": func() {
				check("pathways_to_stop_id_field", pathways_fields.ToStopIdField(db, rules.Rule("pathways_to_stop_id_field")))
			},
			"pathways_length_field": func() {
				check("pathways_length_field", pathways_fields.LengthField(db, rules.Rule("pathways_length_field")))
			},
			"pathways_min_width_field": func() {
				check("pathways_min_width_field", pathways_fields.MinWidthField(db, rules.Rule("pathways_min_width_field")))
			},
			"pathways_reversed_signposted_as_field": func() {
				check("pathways_reversed_signposted_as_field", pathways_fields.ReversedSignpostedAsField(db, rules.Rule("pathways_reversed_signposted_as_field")))
			},
			"pathways_stair_count_field": func() {
				check("pathways_stair_count_field", pathways_fields.StairCountField(db, rules.Rule("pathways_stair_count_field")))
			},
			"pathways_from_stop_id_field": func() {
				check("pathways_from_stop_id_field", pathways_fields.FromStopIdField(db, rules.Rule("pathways_from_stop_id_field")))
			},
			"pathways_pathway_id_field": func() {
				check("pathways_pathway_id_field", pathways_fields.PathwayIdField(db, rules.Rule("pathways_pathway_id_field")))
			},
			"pathways_is_bidirectional_field": func() {
				check("pathways_is_bidirectional_field", pathways_fields.IsBidirectionalField(db, rules.Rule("pathways_is_bidirectional_field")))
			},
			"pathways_signposted_as_field": func() {
				check("pathways_signposted_as_field", pathways_fields.SignpostedAsField(db, rules.Rule("pathways_signposted_as_field")))
			},
			"pathways_pathway_mode_field": func() {
				check("pathways_pathway_mode_field", pathways_fields.PathwayModeField(db, rules.Rule("pathways_pathway_mode_field")))
			},
			"pathway_max_slope_allowed_for_pathway_mode": func() {
				check("pathway_max_slope_allowed_for_pathway_mode", pathways_standard.MaxSlopeValid(db, rules.Rule("pathway_max_slope_allowed_for_pathway_mode")))
			},
			"pathway_traversal_time_non_negative_seconds": func() {
				check("pathway_traversal_time_non_negative_seconds", pathways_standard.TraversalTimeValid(db, rules.Rule("pathway_traversal_time_non_negative_seconds")))
			},
			"pathway_to_stop_id_references_stops_table": func() {
				check("pathway_to_stop_id_references_stops_table", pathways_standard.ToStopIdValid(db, rules.Rule("pathway_to_stop_id_references_stops_table")))
			},
			"pathway_length_non_negative": func() {
				check("pathway_length_non_negative", pathways_standard.LengthValid(db, rules.Rule("pathway_length_non_negative")))
			},
			"pathway_min_width_positive": func() {
				check("pathway_min_width_positive", pathways_standard.MinWidthValid(db, rules.Rule("pathway_min_width_positive")))
			},
			"pathway_stair_count": func() {
				check("pathway_stair_count", pathways_standard.StairCountValid(db, rules.Rule("pathway_stair_count")))
			},
			"pathway_from_stop_id_references_stops_table": func() {
				check("pathway_from_stop_id_references_stops_table", pathways_standard.FromStopIdValid(db, rules.Rule("pathway_from_stop_id_references_stops_table")))
			},
			"pathway_id_unique": func() {
				check("pathway_id_unique", pathways_standard.PathwayIdValid(db, rules.Rule("pathway_id_unique")))
			},
			"pathway_is_bidirectional_valid_gtfs_enum": func() {
				check("pathway_is_bidirectional_valid_gtfs_enum", pathways_standard.IsBidirectionalValid(db, rules.Rule("pathway_is_bidirectional_valid_gtfs_enum")))
			},
			"pathway_mode_valid_gtfs_enum": func() {
				check("pathway_mode_valid_gtfs_enum", pathways_standard.PathwayModeValid(db, rules.Rule("pathway_mode_valid_gtfs_enum")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating pathways: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed pathways.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
