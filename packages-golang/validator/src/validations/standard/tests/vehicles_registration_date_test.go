package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
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
			config := validationutils.VehiclesConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.VehiclesFixture(t, map[string]any{"registration_date": tc.value}, config)
			if err := standard.RegistrationDateValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.VehiclesAssertFindings(t, id, "registration_date", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.VehiclesCheckInvalid(t, id, "registration_date", standard.RegistrationDateValid, map[string]any{"registration_date": "20230229"})
}
