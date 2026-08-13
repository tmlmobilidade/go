package archives

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("archives", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Archives Validations...")
}
