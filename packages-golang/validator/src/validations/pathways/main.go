package pathways

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	pathways_fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/fields/checks"
	pathways_standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/pathways/standard/checks"
	"main/types"
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
			"pathways_max_slope_valid": func() {
				check("pathways_max_slope_valid", pathways_standard.MaxSlopeValid(db, rules.Rule("pathways_max_slope_valid")))
			},
			"pathways_traversal_time_valid": func() {
				check("pathways_traversal_time_valid", pathways_standard.TraversalTimeValid(db, rules.Rule("pathways_traversal_time_valid")))
			},
			"pathways_to_stop_id_foreign": func() {
				check("pathways_to_stop_id_foreign", pathways_standard.ToStopIdForeign(db, rules.Rule("pathways_to_stop_id_foreign")))
			},
			"pathways_length_valid": func() {
				check("pathways_length_valid", pathways_standard.LengthValid(db, rules.Rule("pathways_length_valid")))
			},
			"pathways_min_width_valid": func() {
				check("pathways_min_width_valid", pathways_standard.MinWidthValid(db, rules.Rule("pathways_min_width_valid")))
			},
			"pathways_stair_count_valid": func() {
				check("pathways_stair_count_valid", pathways_standard.StairCountValid(db, rules.Rule("pathways_stair_count_valid")))
			},
			"pathways_from_stop_id_foreign": func() {
				check("pathways_from_stop_id_foreign", pathways_standard.FromStopIdForeign(db, rules.Rule("pathways_from_stop_id_foreign")))
			},
			"pathways_pathway_id_unique": func() {
				check("pathways_pathway_id_unique", pathways_standard.PathwayIdUnique(db, rules.Rule("pathways_pathway_id_unique")))
			},
			"pathways_is_bidirectional_valid": func() {
				check("pathways_is_bidirectional_valid", pathways_standard.IsBidirectionalValid(db, rules.Rule("pathways_is_bidirectional_valid")))
			},
			"pathways_pathway_mode_valid": func() {
				check("pathways_pathway_mode_valid", pathways_standard.PathwayModeValid(db, rules.Rule("pathways_pathway_mode_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating pathways: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed pathways.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
