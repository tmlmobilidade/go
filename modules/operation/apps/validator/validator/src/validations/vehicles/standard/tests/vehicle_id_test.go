package vehicles_standard_test

import (
	"main/types"
	checks "main/validations/vehicles/standard/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestVehicleIdUnique(t *testing.T) {
	const id = "vehicle_id_unique"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"V1", 0},

		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"vehicle_id": tc.value}, config)
			if err := checks.VehicleIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "vehicle_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { testutils.AssertReadFailure(t, checks.VehicleIdUnique, id) })
	t.Run("Duplicate", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		db, ctx := testutils.Fixture(t, map[string]any{"vehicle_id": "V1"}, config)
		if _, err := db.Exec("INSERT INTO vehicles (vehicle_id) VALUES (?)", "V1"); err != nil {
			t.Fatal(err)
		}
		if err := checks.VehicleIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "vehicle_id", types.SEVERITY_ERROR, 1)
	})
}
