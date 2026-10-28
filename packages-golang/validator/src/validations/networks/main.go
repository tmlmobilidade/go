package networks

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"main/types"
)

func init() {
	registry.Register("networks", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Networks Validations...")
}
