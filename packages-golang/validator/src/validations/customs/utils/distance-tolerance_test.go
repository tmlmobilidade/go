package validationutils_test

import (
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	utils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

func TestDistanceTolerance(t *testing.T) {
	if got := utils.DistanceTolerance(nil, 200, true); got != 200 {
		t.Fatalf("missing config: %v", got)
	}
	for _, tc := range []struct {
		name, value string
		allowZero   bool
		want        float64
	}{
		{"positive", "12.5", true, 12.5},
		{"allowed_zero", "0", true, 0},
		{"disallowed_zero", "0", false, 200},
		{"negative", "-1", true, 200},
		{"nan", "NaN", true, 200},
		{"infinite", "+Inf", true, 200},
		{"invalid", "invalid", true, 200},
	} {
		t.Run(tc.name, func(t *testing.T) {
			options := []string{tc.value}
			if got := utils.DistanceTolerance(&rules.RuleContext{Options: &options}, 200, tc.allowZero); got != tc.want {
				t.Fatalf("got %v want %v", got, tc.want)
			}
		})
	}
	options := []string{}
	if got := utils.DistanceTolerance(&rules.RuleContext{Options: &options}, 200, false); got != 200 {
		t.Fatalf("empty options: %v", got)
	}
}
