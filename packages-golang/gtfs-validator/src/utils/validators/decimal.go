package validators

import (
	"math"
	"regexp"
	"strconv"
	"strings"
)

var decimal = regexp.MustCompile(`^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$`)

// ValidateDecimal checks that a finite decimal number is within the inclusive range.
func ValidateDecimal(value string, min, max float64) bool {
	value = strings.TrimSpace(value)
	if !decimal.MatchString(value) {
		return false
	}
	number, err := strconv.ParseFloat(value, 64)
	return err == nil && !math.IsInf(number, 0) && number >= min && number <= max
}
