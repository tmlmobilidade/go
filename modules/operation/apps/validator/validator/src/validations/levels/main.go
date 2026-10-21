package levels

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/levels/validations"
)

func init() {
	registry.Register("levels", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "levels")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Validations for levels.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "levels", config.ProgressThresholdLarge)

	err := gtfs.IterateLevels(func(row int, rawLevel types.LevelsRaw) error {
		tracker.Track()
		level := validations.ParseLevel(rawLevel, row)

		if level == (types.Levels{}) {
			return nil
		}

		runner.Run(services.RuleActions{
			"level_id_unique":      func() { validations.LevelIdValidation(&level, row, gtfs, rules.Rule("level_id_unique")) },
			"level_index_required": func() { validations.LevelIndexValidation(&level, row, rules.Rule("level_index_required")) },
			"level_name":           func() { validations.LevelNameValidation(&level, row, rules.Rule("level_name")) },
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating levels: %v", err))
	}
}
