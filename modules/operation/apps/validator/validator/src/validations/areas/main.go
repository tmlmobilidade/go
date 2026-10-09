package areas

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("areas", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Areas Validations...")
}
