package pathways

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/pathways/validations"
)

func init() {
	registry.Register("pathways", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.PathwayIdValidation(&pathways, row, &gtfs, pathwaysRules)

		// Validate pathway_mode
		validations.PathwayModeValidation(&pathways, row, pathwaysRules)

		// Validate is_bidirectional
		validations.IsBidirectionalValidation(&pathways, row, pathwaysRules)

		// Validate traversal_time
		validations.TraversalTimeValidation(&pathways, row, pathwaysRules)

		// Validate from_stop_id
		validations.FromStopIdValidation(&pathways, row, &gtfs, pathwaysRules)

		// Validate to_stop_id
		validations.ToStopIdValidation(&pathways, row, &gtfs, pathwaysRules)

		// Validate length
		validations.LengthValidation(&pathways, row, pathwaysRules)

		// Validate max_slope
		validations.MaxSlopeValidation(&pathways, row, pathwaysRules)

		// Validate min_width
		validations.MinWidthValidation(&pathways, row, pathwaysRules)

		// Validate stair_count
		validations.StairCountValidation(&pathways, row, pathwaysRules)

		// Validate signposted_as
		validations.SignpostedAsValidation(&pathways, row, pathwaysRules)

		// Validate reversed_signposted_as
		validations.ReversedSignpostedAsValidation(&pathways, row, pathwaysRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating pathways: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed pathways.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
