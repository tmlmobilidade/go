package afetacao

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("afetacao", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Afetacao Validations...")
}
