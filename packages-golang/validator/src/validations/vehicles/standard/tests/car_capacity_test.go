package vehicles_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"main/types"
	"testing"
)

func TestCarCapacityValid(t *testing.T) {
	const id = "vehicles_car_capacity_valid"
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
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"car_capacity": tc.value}, config)
			if err := checks.CarCapacityValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "car_capacity", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "car_capacity", checks.CarCapacityValid, map[string]any{"car_capacity": "-1"})
}
