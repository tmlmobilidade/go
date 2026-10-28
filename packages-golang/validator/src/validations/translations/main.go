package translations

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	registry "github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	"main/types"
)

func init() {
	registry.Register("translations", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Translations Validations...")
}
