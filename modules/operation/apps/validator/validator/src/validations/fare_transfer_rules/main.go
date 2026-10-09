package fare_transfer_rules

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("fare_transfer_rules", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareTransferRules Validations...")
}
