package fare_leg_rules

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("fare_leg_rules", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareLegRules Validations...")
}
