package pathways

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/pathways/validations"
)

func init() {
	registry.Register("pathways", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.PathwaysRules
	if rules != nil {
		section = &rules.Pathways
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Pathways Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "pathways", config.ProgressThresholdLarge)

	err := gtfs.IteratePathways(func(row int, rawPathways types.PathwaysRaw) error {
		tracker.Track()

		pathways := validations.ParsePathways(rawPathways, row)

		if pathways == (types.Pathways{}) {
			return nil
		}

		var pathwaysRules *types.PathwaysRules
		if rules != nil {
			pathwaysRules = &rules.Pathways
		}
		// Validate pathway_id
		runner.Run(services.RuleActions{
			"pathway_id_unique":                           func() { validations.PathwayIdValidation(&pathways, row, &gtfs, pathwaysRules) },
			"pathway_mode_valid_gtfs_enum":                func() { validations.PathwayModeValidation(&pathways, row, pathwaysRules) },
			"pathway_is_bidirectional_valid_gtfs_enum":    func() { validations.IsBidirectionalValidation(&pathways, row, pathwaysRules) },
			"pathway_traversal_time_non_negative_seconds": func() { validations.TraversalTimeValidation(&pathways, row, pathwaysRules) },
			"pathway_from_stop_id_references_stops_table": func() { validations.FromStopIdValidation(&pathways, row, &gtfs, pathwaysRules) },
			"pathway_to_stop_id_references_stops_table":   func() { validations.ToStopIdValidation(&pathways, row, &gtfs, pathwaysRules) },
			"pathway_length_non_negative":                 func() { validations.LengthValidation(&pathways, row, pathwaysRules) },
			"pathway_max_slope_allowed_for_pathway_mode":  func() { validations.MaxSlopeValidation(&pathways, row, pathwaysRules) },
			"pathway_min_width_positive":                  func() { validations.MinWidthValidation(&pathways, row, pathwaysRules) },
			"pathway_stair_count":                         func() { validations.StairCountValidation(&pathways, row, pathwaysRules) },
			"pathway_signposted_as":                       func() { validations.SignpostedAsValidation(&pathways, row, pathwaysRules) },
			"pathway_reversed_signposted_as":              func() { validations.ReversedSignpostedAsValidation(&pathways, row, pathwaysRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating pathways: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed pathways.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
