package attributions

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("attributions", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Attributions Validations...")
}
