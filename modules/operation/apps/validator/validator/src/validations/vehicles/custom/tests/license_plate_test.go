package vehicles_custom_test

import (
	"main/types"
	checks "main/validations/vehicles/custom/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestLicensePlateValid(t *testing.T) {
	const id = "vehicles_license_plate_format_per_market_rules"
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
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"license_plate": tc.value}, config)
			if err := checks.LicensePlateValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "license_plate", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "license_plate", checks.LicensePlateValid, map[string]any{"license_plate": "bad"})
	t.Run("Duplicate", func(t *testing.T) {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		db, ctx := testutils.Fixture(t, map[string]any{"license_plate": "AA1234"}, config)
		if _, err := db.Exec("INSERT INTO vehicles (license_plate) VALUES (?)", "AA1234"); err != nil {
			t.Fatal(err)
		}
		if err := checks.LicensePlateValid(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "license_plate", types.SEVERITY_ERROR, 1)
	})
}
