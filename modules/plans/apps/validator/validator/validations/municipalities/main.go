package municipalities

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("municipalities", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Municipalities Validations...")
}
