package validationutils_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
	"testing"
)

func TestShapeDistanceScale(t *testing.T) {
	if got := utils.ShapeDistanceScale(nil, 799); got != 1000 {
		t.Fatalf("kilometer heuristic: %v", got)
	}
	if got := utils.ShapeDistanceScale(nil, 800); got != 1 {
		t.Fatalf("meter heuristic: %v", got)
	}
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
			options := []string{"20", tc.unit}
			if got := utils.ShapeDistanceScale(&rules.RuleContext{Options: &options}, tc.max); got != tc.want {
				t.Fatalf("got %v want %v", got, tc.want)
			}
		})
	}
}
