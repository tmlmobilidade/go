package networks

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("networks", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Networks Validations...")
}
