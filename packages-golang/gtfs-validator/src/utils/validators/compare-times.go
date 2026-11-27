package validators

import (
	"cmp"
	"strings"
)

// CompareTimes compares two valid GTFS service-day times. Hours can exceed 24.
func CompareTimes(left, right string) (int, bool) {
	left, right = strings.TrimSpace(left), strings.TrimSpace(right)
	if !ValidateTime(left) || !ValidateTime(right) {
		return 0, false
	}

	// Removing hour padding leaves a fixed-width minute and second suffix.
	// Compare lengths before bytes so hour values can be arbitrarily large.
	left, right = strings.TrimLeft(left, "0"), strings.TrimLeft(right, "0")
	if widthOrder := cmp.Compare(len(left), len(right)); widthOrder != 0 {
		return widthOrder, true
	}
	return cmp.Compare(left, right), true
}
