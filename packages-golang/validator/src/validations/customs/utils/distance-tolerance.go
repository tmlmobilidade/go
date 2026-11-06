package validationutils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	"math"
	"strconv"
)

// DistanceTolerance resolves options[0], preserving each rule's zero-tolerance policy.
func DistanceTolerance(config *rules.RuleContext, fallback float64, allowZero bool) float64 {
	if config == nil || config.Options == nil || len(*config.Options) == 0 {
		return fallback
	}
	value, err := strconv.ParseFloat((*config.Options)[0], 64)
	if err != nil || value < 0 || !allowZero && value == 0 || math.IsNaN(value) || math.IsInf(value, 0) {
		return fallback
	}
	return value
}
