package translations

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("translations", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Translations Validations...")
}
