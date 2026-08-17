package booking_rules

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("booking_rules", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Booking Rules Validations...")
}
