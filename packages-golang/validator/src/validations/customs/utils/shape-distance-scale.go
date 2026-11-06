package validationutils

import (
	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	"strings"
)

// ShapeDistanceScale honors an explicit unit before applying the feed heuristic.
func ShapeDistanceScale(config *rules.RuleContext, maxInShape float64) float64 {
	if config != nil && config.Options != nil && len(*config.Options) > 1 {
		switch strings.ToLower(strings.TrimSpace((*config.Options)[1])) {
		case "m":
			return 1
		case "km":
			return 1000
		}
	}
	return mathgeo.ShapeDistTraveledToMeters(1, maxInShape)
}
