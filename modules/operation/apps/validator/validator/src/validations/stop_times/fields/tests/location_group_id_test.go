package stop_times_fields_test

import (
	checks "main/validations/stop_times/fields/checks"
	testutils "main/validations/stop_times/utils"
	"testing"
)

func TestLocationGroupIdField(t *testing.T) {
	testutils.CheckCases(t, "stop_times_location_group_id_field", "location_group_id", checks.LocationGroupIdField, []testutils.Case{

		{Name: "MissingColumns", Values: map[string]any{}},
		{Name: "Null", Values: map[string]any{"location_group_id": nil}},
		{Name: "GroupOnly", Values: map[string]any{"location_group_id": "G1"}},
		{Name: "MatchingStop", Values: map[string]any{"location_group_id": "G1", "stop_id": "G1"}, Count: 1},
		{Name: "MatchingLocation", Values: map[string]any{"location_group_id": "G1", "location_id": "G1"}, Count: 1},
		{Name: "DifferentIdentifiers", Values: map[string]any{"location_group_id": "G1", "stop_id": "S1", "location_id": "L1"}},
	})
}
