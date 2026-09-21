package fare_products

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("fare_products", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareProducts Validations...")
}
