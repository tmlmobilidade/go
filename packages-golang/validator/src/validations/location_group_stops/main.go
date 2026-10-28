package location_group_stops

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"main/types"
)

func init() {
	registry.Register("location_group_stops", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running LocationGroupStops Validations...")
}
