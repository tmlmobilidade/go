package fare_products

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"main/types"
)

func init() {
	registry.Register("fare_products", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareProducts Validations...")
}
