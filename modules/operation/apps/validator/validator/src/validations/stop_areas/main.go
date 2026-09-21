package stop_areas

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("stop_areas", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running StopAreas Validations...")
}
