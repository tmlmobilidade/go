package route_networks

import (
	"main/lib"
	"main/types"
	registry "main/validations"
)

func init() {
	registry.Register("route_networks", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running RouteNetworks Validations...")
}
