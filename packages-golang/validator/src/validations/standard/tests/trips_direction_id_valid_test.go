package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestDirectionIdValid(t *testing.T) {
	const id = "trips_direction_id_valid"
	for _, tc := range []struct {
		value string
		count int
	}{{"0", 0},
		{"1", 0}, {"2", 1}, {"-1", 1}, {"bad", 1}, {"1.5", 1}, {"", 0}} {
		t.Run(tc.value, func(t *testing.T) {
			config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TripsFixture(t, map[string]any{"direction_id": tc.value}, config)
			if err := standard.DirectionIdValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TripsAssertFindings(t, id, "direction_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	for _, tc := range []struct {
		name    string
		options []string
		count   int
	}{{"Allowed", []string{"1"}, 0}, {"Rejected", []string{"0"}, 1}, {"All", []string{types.ALL_OPTIONS}, 0}, {"Empty", []string{}, 1}} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TripsConfig(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := validationutils.TripsFixture(t, map[string]any{"direction_id": "1"}, config)
			if err := standard.DirectionIdValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TripsAssertFindings(t, id, "direction_id", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TripsCheckInvalid(t, id, "direction_id", standard.DirectionIdValid, map[string]any{"direction_id": "bad"})
}
