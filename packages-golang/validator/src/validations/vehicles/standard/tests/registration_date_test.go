package vehicles_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"main/types"
	"testing"
)

func TestRegistrationDateValid(t *testing.T) {
	const id = "vehicles_registration_date_valid"
	for _, tc := range []struct {
		value string
		count int
	}{
		{"20240229", 0},
		{"20230229", 1},
		{"20241301", 1},
		{"bad", 1},
		{"", 0},
	} {
		t.Run(tc.value, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"registration_date": tc.value}, config)
			if err := checks.RegistrationDateValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "registration_date", types.SEVERITY_ERROR, tc.count)
		})
	}
	testutils.CheckInvalid(t, id, "registration_date", checks.RegistrationDateValid, map[string]any{"registration_date": "20230229"})
}
