package periods

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("periods", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Periods Validations...")
}
