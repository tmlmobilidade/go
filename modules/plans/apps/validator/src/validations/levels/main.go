package levels

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/levels/validations"
)

func init() {
	registry.Register("levels", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Validations for levels.txt")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "levels", config.ProgressThresholdLarge)

	err := gtfs.IterateLevels(func(row int, rawLevel types.LevelsRaw) error {
		tracker.Track()
		level := validations.ParseLevel(rawLevel, row)

		if level == (types.Levels{}) {
			return nil
		}

		var levelRules *types.LevelsRules
		if rules != nil {
			levelRules = &rules.Levels
		}

		validations.LevelIdValidation(&level, row, gtfs, levelRules)
		validations.LevelIndexValidation(&level, row, levelRules)
		validations.LevelNameValidation(&level, row, levelRules)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating levels: %v", err))
	}
}
