package location_group_stops

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("location_group_stops", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running LocationGroupStops Validations...")
}
