package stop_times_standard_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestLocationGroupIdForbidden(t *testing.T) {
	testutils.CheckCases(t, "stop_times_location_group_id_forbidden", "location_group_id", checks.LocationGroupIdForbidden, []testutils.Case{
		{Name: "Missing", Values: map[string]any{}, Count: 0},
		{Name: "Null", Values: map[string]any{"location_group_id": nil, "stop_id": "S1", "location_id": "X"}, Count: 0},
		{Name: "Empty", Values: map[string]any{"location_group_id": "", "stop_id": "S1", "location_id": "X"}, Count: 0},
		{Name: "OnlyLocation", Values: map[string]any{"location_group_id": "L1"}, Count: 0},
		{Name: "EmptyConflicts", Values: map[string]any{"location_group_id": "L1", "stop_id": "", "location_id": nil}, Count: 0},
		{Name: "WithStop", Values: map[string]any{"location_group_id": "L1", "stop_id": "S1"}, Count: 1},
		{Name: "WithOtherLocation", Values: map[string]any{"location_group_id": "L1", "location_id": "X"}, Count: 1},
		{Name: "WithBoth", Values: map[string]any{"location_group_id": "L1", "stop_id": "S1", "location_id": "X"}, Count: 1},
		{Name: "ZeroIsDefined", Values: map[string]any{"location_group_id": "0", "stop_id": "0"}, Count: 1},
	})
}
