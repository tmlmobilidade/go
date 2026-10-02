package timeframes

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("timeframes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running TimeFrames Validations...")
}
