package stop_times_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestLocationGroupIdForbidden(t *testing.T) {
	testutils.CheckCases(t, "stop_times_location_group_id_forbidden", "location_group_id", checks.LocationGroupIdForbidden, []testutils.Case{
		{Name: "Valid0", Values: map[string]any{"location_group_id": "G1"}, Count: 0, WantError: false},
		{Name: "Invalid0", Values: map[string]any{"location_group_id": ""}, Count: 1, WantError: false},
		{Name: "Invalid1", Values: map[string]any{"location_group_id": nil}, Count: 1, WantError: false},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	})
}
