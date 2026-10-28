package custom_test

import (
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestLicensePlateValid(t *testing.T) {
	const id = "vehicles_license_plate_valid"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"AA1234", 0},
		{"234567890", 0},
		{"bad", 1},
		{"12345", 1},
		{"123456789", 1},
		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"license_plate": tc.value}, config)
			if err := custom.LicensePlateValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "license_plate", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.VehiclesCheckInvalid(t, id, "license_plate", custom.LicensePlateValid, map[string]any{"license_plate": "bad"})
	t.Run("Duplicate", func(t *testing.T) {
		config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
		db, ctx := validationutils.VehiclesFixture(t, map[string]any{"license_plate": "AA1234"}, config)
		if _, err := db.Exec("INSERT INTO vehicles (license_plate) VALUES (?)", "AA1234"); err != nil {
			t.Fatal(err)
		}
		if err := custom.LicensePlateValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.VehiclesAssertFindings(t, id, "license_plate", types.SEVERITY_ERROR, 1)
	})
}
