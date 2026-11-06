package validationutils_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
	"testing"
)

/*
* TestShapeDistanceScale checks the kilometer-to-meter and meter-to-meter scales.
* It verifies the heuristic boundary and explicit unit overrides, including unit
* normalization and fallback for an unrecognized unit.
 */
func TestShapeDistanceScale(t *testing.T) {

	//
	// 1. Treat a maximum below 800 as kilometers when no unit is configured.

	if got := utils.ShapeDistanceScale(nil, 799); got != 1000 {
		t.Fatalf("kilometer heuristic: %v", got)
	}

	//
	// 2. Treat a maximum exactly at the 800 threshold as meters.

	if got := utils.ShapeDistanceScale(nil, 800); got != 1 {
		t.Fatalf("meter heuristic: %v", got)
	}

	//
	// 3. Check explicit overrides, case and whitespace normalization, and fallback.

	for _, tc := range []struct {
		name, unit string
		max, want  float64
	}{
		{"meters_override_kilometer_heuristic", "m", 1, 1},
		{"kilometers_override_meter_heuristic", "km", 1000, 1000},
		{"normalized_units", " KM ", 1000, 1000},
		{"unknown_unit_uses_heuristic", "unknown", 799, 1000},
	} {
		t.Run(tc.name, func(t *testing.T) {

			//
			// 4. Place the unit in the second rule option, after the distance tolerance.

			options := []string{"20", tc.unit}

			//
			// 5. Require the multiplier selected by the explicit unit or shape maximum.

			if got := utils.ShapeDistanceScale(&rules.RuleContext{Options: &options}, tc.max); got != tc.want {
				t.Fatalf("got %v want %v", got, tc.want)
			}
		})
	}
}
