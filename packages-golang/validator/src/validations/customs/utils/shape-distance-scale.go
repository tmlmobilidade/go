package validationutils

import (
	"strings"

	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

/*
* ShapeDistanceScale returns the multiplier that converts recorded distances to
* meters. The second rule option may explicitly select m or km, ignoring case and
* surrounding spaces. Otherwise, geo.ShapeDistTraveledToMeters uses the shape's
* maximum recorded distance to choose the scale.
 */
func ShapeDistanceScale(config *rules.RuleContext, maxInShape float64) float64 {

	//
	// 1. Prefer a recognized unit from the second rule option.

	if config != nil && config.Options != nil && len(*config.Options) > 1 {
		switch strings.ToLower(strings.TrimSpace((*config.Options)[1])) {
		case "m":
			return 1
		case "km":
			return 1000
		}
	}

	//
	// 2. Convert one recorded unit through geo to obtain the shape-wide meter scale.

	return mathgeo.ShapeDistTraveledToMeters(1, maxInShape)
}
