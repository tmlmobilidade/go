package vehicles_standard_test

import (
	"main/types"
	checks "main/validations/vehicles/standard/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestVehicleTypeValid(t *testing.T) {
	const id = "vehicles_vehicle_type_valid_enum"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"0", 0},
		{"1", 0},
		{"2", 0},
		{"3", 0},
		{"4", 0},
		{"5", 0},
		{"6", 0},
		{"7", 0},
		{"11", 0},
		{"12", 0},
		{"8", 1},
		{"13", 1},
		{"bad", 1},
		{"1.5", 1},
		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"vehicle_type": tc.value}, config)
			if err := checks.VehicleTypeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "vehicle_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "vehicle_type", checks.VehicleTypeValid, map[string]any{"vehicle_type": "8"})
	for _, tc := range []struct {
		name    string
		options []string
		count   int
	}{
		{"Allowed", []string{"0"}, 0},
		{"NotAllowed", []string{"other"}, 1},
		{"All", []string{types.ALL_OPTIONS}, 0},
		{"EmptyOptions", []string{}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := testutils.Fixture(t, map[string]any{"vehicle_type": "0"}, config)
			if err := checks.VehicleTypeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "vehicle_type", types.SEVERITY_ERROR, tc.count)
		})
	}
}
