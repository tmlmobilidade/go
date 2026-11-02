package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestBicyclesCapacityValid(t *testing.T) {
	const id = "vehicles_bicycles_capacity_valid"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"0", 0},
		{"1", 0},
		{"100", 0},
		{"-1", 1},
		{"1.5", 1},
		{"bad", 1},
		{"9999999999999999999999999", 1},
		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"bicycles_capacity": tc.value}, config)
			if err := standard.BicyclesCapacityValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "bicycles_capacity", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.VehiclesCheckInvalid(t, id, "bicycles_capacity", standard.BicyclesCapacityValid, map[string]any{"bicycles_capacity": "-1"})
}
