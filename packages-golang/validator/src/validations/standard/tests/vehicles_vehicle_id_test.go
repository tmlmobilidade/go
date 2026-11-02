package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestVehicleIdUnique(t *testing.T) {
	const id = "vehicles_vehicle_id_unique"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"V1", 0},

		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"vehicle_id": tc.value}, config)
			if err := standard.VehicleIdUnique(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "vehicle_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) { validationutils.VehiclesAssertReadFailure(t, standard.VehicleIdUnique, id) })
	t.Run("Duplicate", func(t *testing.T) {
		config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
		db, ctx := validationutils.VehiclesFixture(t, map[string]any{"vehicle_id": "V1"}, config)
		if _, err := db.Exec("INSERT INTO vehicles (vehicle_id) VALUES (?)", "V1"); err != nil {
			t.Fatal(err)
		}
		if err := standard.VehicleIdUnique(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.VehiclesAssertFindings(t, id, "vehicle_id", types.SEVERITY_ERROR, 1)
	})
}
