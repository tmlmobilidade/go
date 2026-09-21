package location_groups

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("location_groups", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running LocationGroups Validations...")
}
