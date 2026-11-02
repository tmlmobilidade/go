package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLocationIdForbidden(t *testing.T) {
	validationutils.StopTimesCheckCases(t, "stop_times_location_id_forbidden", "location_id", standard.LocationIdForbidden, []validationutils.StopTimesCase{
		{Name: "Missing", Values: map[string]any{}, Count: 0},
		{Name: "Null", Values: map[string]any{"location_id": nil, "stop_id": "S1", "location_group_id": "X"}, Count: 0},
		{Name: "Empty", Values: map[string]any{"location_id": "", "stop_id": "S1", "location_group_id": "X"}, Count: 0},
		{Name: "OnlyLocation", Values: map[string]any{"location_id": "L1"}, Count: 0},
		{Name: "EmptyConflicts", Values: map[string]any{"location_id": "L1", "stop_id": "", "location_group_id": nil}, Count: 0},
		{Name: "WithStop", Values: map[string]any{"location_id": "L1", "stop_id": "S1"}, Count: 1},
		{Name: "WithOtherLocation", Values: map[string]any{"location_id": "L1", "location_group_id": "X"}, Count: 1},
		{Name: "WithBoth", Values: map[string]any{"location_id": "L1", "stop_id": "S1", "location_group_id": "X"}, Count: 1},
		{Name: "ZeroIsDefined", Values: map[string]any{"location_id": "0", "stop_id": "0"}, Count: 1},
	})
}
